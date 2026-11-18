const router = require("express").Router();
const prisma = require("../utils/prisma");
const { protect, adminOnly } = require("../middleware/auth");
const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

router.get("/", async (req, res, next) => {
  try {
    res.json({
      success: true,
      categories: await prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      }),
    });
  } catch (e) {
    next(e);
  }
});
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    const category = await prisma.category.create({
      data: { name, slug: slugify(name) },
    });
    res.status(201).json({ success: true, category });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
