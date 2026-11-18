const router = require("express").Router();
const prisma = require("../utils/prisma");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res, next) => {
  try {
    const { search = "", category = "", page = "1", limit = "50" } = req.query;
    const take = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const where = {
      active: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);
    res.json({
      success: true,
      products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / take) },
    });
  } catch (e) {
    next(e);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, active: true },
      include: { category: true },
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (e) {
    next(e);
  }
});
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    if (
      !name ||
      !description ||
      !categoryId ||
      Number(price) < 0 ||
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    )
      return res
        .status(400)
        .json({ success: false, message: "Valid product fields are required" });
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || null,
        categoryId,
      },
    });
    if (Number(stock))
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          change: Number(stock),
          reason: "Initial stock",
        },
      });
    res.status(201).json({ success: true, product });
  } catch (e) {
    next(e);
  }
});
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId, active } =
      req.body;
    const old = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!old)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    const data = {};
    for (const key of [
      "name",
      "description",
      "imageUrl",
      "categoryId",
      "active",
    ])
      if (req.body[key] !== undefined) data[key] = req.body[key];
    if (price !== undefined) data.price = Number(price);
    if (stock !== undefined) data.stock = Number(stock);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });
    if (stock !== undefined && Number(stock) !== old.stock)
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          change: Number(stock) - old.stock,
          reason: "Admin stock adjustment",
        },
      });
    res.json({ success: true, product });
  } catch (e) {
    next(e);
  }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ success: true, message: "Product archived" });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
