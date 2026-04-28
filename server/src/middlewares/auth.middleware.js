const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const HttpError = require("../utils/http-error");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError(401, "Требуется авторизация."));
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return next(new HttpError(401, "Пользователь не найден или неактивен."));
    }

    req.user = user;
    return next();
  } catch (_error) {
    return next(new HttpError(401, "Недействительный токен."));
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new HttpError(401, "Требуется авторизация."));
  }

  const userRole = req.user.role?.name;
  if (!roles.includes(userRole)) {
    return next(new HttpError(403, "Недостаточно прав для выполнения операции."));
  }

  return next();
};

module.exports = {
  authenticate,
  authorizeRoles,
};
