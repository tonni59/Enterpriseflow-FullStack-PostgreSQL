const router = require("express").Router();
const prisma = require("../utils/prisma");
const { protect } = require("../middleware/auth");
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { category: true } } },
    });
    res.json({ success: true, items });
  } catch (e) {
    next(e);
  }
});
router.post("/", async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);
    const product = await prisma.product.findFirst({
      where: { id: productId, active: true },
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    if (!Number.isInteger(qty) || qty < 1 || qty > product.stock)
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid quantity or insufficient stock",
        });
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    const nextQty = (existing?.quantity || 0) + qty;
    if (nextQty > product.stock)
      return res
        .status(400)
        .json({ success: false, message: "Quantity exceeds available stock" });
    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { quantity: nextQty },
      create: { userId: req.user.id, productId, quantity: qty },
    });
    res.json({ success: true, item });
  } catch (e) {
    next(e);
  }
});
router.delete("/:productId", async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    res.json({ success: true, message: "Item removed" });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
