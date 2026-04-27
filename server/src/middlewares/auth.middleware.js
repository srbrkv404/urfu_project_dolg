const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Требуется авторизация." });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Пользователь не найден или неактивен." });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Недействительный токен." });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Требуется авторизация." });
  }

  const userRole = req.user.role?.name;
  if (!roles.includes(userRole)) {
    return res.status(403).json({ message: "Недостаточно прав для выполнения операции." });
  }

  return next();
};

module.exports = {
  authenticate,
  authorizeRoles,
};
