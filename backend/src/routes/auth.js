const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { protect } = require("../middleware/auth");

const makeToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8)
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Name, valid email and password (8+ characters) are required",
        });
    const normalizedEmail = email.toLowerCase().trim();
    if (await prisma.user.findUnique({ where: { email: normalizedEmail } }))
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(password, 12),
      },
    });
    res
      .status(201)
      .json({
        success: true,
        token: makeToken(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (e) {
    next(e);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
      .toLowerCase()
      .trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      !(await bcrypt.compare(req.body.password || "", user.password))
    )
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    res.json({
      success: true,
      token: makeToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
});
router.get("/me", protect, (req, res) =>
  res.json({ success: true, user: req.user }),
);
module.exports = router;
