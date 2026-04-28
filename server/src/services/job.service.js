const { z } = require("zod");
const prisma = require("../lib/prisma");
const HttpError = require("../utils/http-error");

const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2).optional(),
  employmentType: z.enum(["PART_TIME", "TEMPORARY", "INTERNSHIP", "PROJECT"]),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  departmentId: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  internshipProgramId: z.number().int().positive().optional(),
});

const mapZodDetails = (issues) =>
  issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    issue: issue.message,
    expected: issue.code,
  }));

const getEmployerProfileId = async (userId) => {
  const profile = await prisma.employerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new HttpError(403, "Профиль работодателя не найден.");
  }

  return profile.id;
};

const createJob = async (userId, payload) => {
  const parsed = createJobSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(400, "Некорректные данные вакансии.", {
      details: mapZodDetails(parsed.error.issues),
    });
  }

  const employerProfileId = await getEmployerProfileId(userId);
  const data = parsed.data;

  if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
    throw new HttpError(400, "Минимальная зарплата не может быть больше максимальной.");
  }

  return prisma.jobPost.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      employmentType: data.employmentType,
      workMode: data.workMode,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      status: "PUBLISHED",
      employerProfileId,
      departmentId: data.departmentId,
      categoryId: data.categoryId,
      internshipProgramId: data.internshipProgramId,
    },
  });
};

const getMyJobs = async (userId) => {
  const employerProfileId = await getEmployerProfileId(userId);

  return prisma.jobPost.findMany({
    where: { employerProfileId },
    orderBy: { createdAt: "desc" },
  });
};

const getJobApplications = async (userId, jobId) => {
  const employerProfileId = await getEmployerProfileId(userId);
  const parsedJobId = Number(jobId);

  const job = await prisma.jobPost.findFirst({
    where: { id: parsedJobId, employerProfileId },
  });

  if (!job) {
    throw new HttpError(404, "Вакансия не найдена.");
  }

  return prisma.application.findMany({
    where: { jobPostId: parsedJobId },
    include: {
      studentProfile: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

module.exports = {
  createJob,
  getMyJobs,
  getJobApplications,
};
