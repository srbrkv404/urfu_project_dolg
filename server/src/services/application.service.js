const { z } = require("zod");
const prisma = require("../lib/prisma");
const HttpError = require("../utils/http-error");

const createApplicationSchema = z.object({
  jobPostId: z.number().int().positive(),
  coverLetter: z.string().min(5).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["REVIEWING", "ACCEPTED", "REJECTED"]),
  note: z.string().min(2).optional(),
});

const mapZodDetails = (issues) =>
  issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    issue: issue.message,
    expected: issue.code,
  }));

const getStudentProfileId = async (userId) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new HttpError(403, "Профиль студента не найден.");
  }

  return profile.id;
};

const createApplication = async (userId, payload) => {
  const parsed = createApplicationSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(400, "Некорректные данные отклика.", {
      details: mapZodDetails(parsed.error.issues),
    });
  }

  const studentProfileId = await getStudentProfileId(userId);
  const { jobPostId, coverLetter } = parsed.data;

  const job = await prisma.jobPost.findUnique({ where: { id: jobPostId } });
  if (!job || job.status !== "PUBLISHED") {
    throw new HttpError(404, "Вакансия не найдена или недоступна.");
  }

  const existing = await prisma.application.findUnique({
    where: { jobPostId_studentProfileId: { jobPostId, studentProfileId } },
  });

  if (existing) {
    throw new HttpError(409, "Вы уже откликались на эту вакансию.");
  }

  return prisma.$transaction(async (tx) => {
    const application = await tx.application.create({
      data: {
        jobPostId,
        studentProfileId,
        coverLetter,
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        changedById: userId,
        fromStatus: null,
        toStatus: "SUBMITTED",
      },
    });

    return application;
  });
};

const updateApplicationStatus = async (userId, applicationId, payload) => {
  const parsed = updateStatusSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(400, "Некорректный статус.", {
      details: mapZodDetails(parsed.error.issues),
    });
  }

  const parsedId = Number(applicationId);
  const application = await prisma.application.findUnique({
    where: { id: parsedId },
    include: { jobPost: true },
  });

  if (!application) {
    throw new HttpError(404, "Отклик не найден.");
  }

  const employerProfile = await prisma.employerProfile.findUnique({
    where: { userId },
  });

  if (!employerProfile || application.jobPost.employerProfileId !== employerProfile.id) {
    throw new HttpError(403, "Недостаточно прав для изменения статуса.");
  }

  const { status, note } = parsed.data;
  if (application.status === status) {
    throw new HttpError(400, "Статус уже установлен.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id: parsedId },
      data: { status },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: parsedId,
        changedById: userId,
        fromStatus: application.status,
        toStatus: status,
        note,
      },
    });

    return updated;
  });
};

const getApplicationHistory = async (userId, applicationId) => {
  const parsedId = Number(applicationId);
  const application = await prisma.application.findUnique({
    where: { id: parsedId },
    include: {
      studentProfile: true,
      jobPost: true,
    },
  });

  if (!application) {
    throw new HttpError(404, "Отклик не найден.");
  }

  const [employerProfile, studentProfile] = await Promise.all([
    prisma.employerProfile.findUnique({ where: { userId } }),
    prisma.studentProfile.findUnique({ where: { userId } }),
  ]);

  const isEmployerOwner = employerProfile && application.jobPost.employerProfileId === employerProfile.id;
  const isStudentOwner = studentProfile && application.studentProfileId === studentProfile.id;

  if (!isEmployerOwner && !isStudentOwner) {
    throw new HttpError(403, "Недостаточно прав для просмотра истории.");
  }

  return prisma.applicationStatusHistory.findMany({
    where: { applicationId: parsedId },
    include: {
      changedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};

module.exports = {
  createApplication,
  updateApplicationStatus,
  getApplicationHistory,
};
