const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Account not found" });
    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}
function adminOnly(req, res, next) {
  if (req.user?.role !== "ADMIN")
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  next();
}
module.exports = { protect, adminOnly };
