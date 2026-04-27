const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const HttpError = require("../utils/http-error");
const { ROLE } = require("../config/constants");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum([ROLE.STUDENT, ROLE.EMPLOYER]),
  studyProgram: z.string().min(2).optional(),
  courseYear: z.number().int().min(1).max(6).optional(),
  organization: z.string().min(2).optional(),
  positionTitle: z.string().min(2).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ensureRole = async (name) => {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  });
};

const signToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

const register = async (payload) => {
  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(400, "Некорректные данные регистрации.");
  }

  const data = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new HttpError(409, "Пользователь с таким email уже существует.");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  await ensureRole(ROLE.STUDENT);
  await ensureRole(ROLE.EMPLOYER);

  const role = await prisma.role.findUnique({ where: { name: data.role } });
  if (!role) {
    throw new HttpError(500, "Ошибка настройки ролей.");
  }

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        roleId: role.id,
      },
      include: { role: true },
    });

    if (data.role === ROLE.STUDENT) {
      await tx.studentProfile.create({
        data: {
          userId: createdUser.id,
          studyProgram: data.studyProgram || "Не указано",
          courseYear: data.courseYear || 1,
        },
      });
    } else {
      await tx.employerProfile.create({
        data: {
          userId: createdUser.id,
          organization: data.organization || "Университет",
          positionTitle: data.positionTitle || "Сотрудник",
        },
      });
    }

    return createdUser;
  });

  return {
    token: signToken(user),
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
    },
  };
};

const login = async (payload) => {
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(400, "Некорректные данные входа.");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { role: true },
  });

  if (!user) {
    throw new HttpError(401, "Неверный email или пароль.");
  }

  const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, "Неверный email или пароль.");
  }

  return {
    token: signToken(user),
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
    },
  };
};

module.exports = {
  register,
  login,
};
