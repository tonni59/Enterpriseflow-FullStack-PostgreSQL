const router = require("express").Router();
const prisma = require("../utils/prisma");
const { protect } = require("../middleware/auth");
router.use(protect);

router.post("/", async (req, res, next) => {
  try {
    const shippingAddress = String(req.body.shippingAddress || "").trim();
    if (shippingAddress.length < 8)
      return res
        .status(400)
        .json({
          success: false,
          message: "A complete shipping address is required",
        });
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cartItem.findMany({
        where: { userId: req.user.id },
        include: { product: true },
      });
      if (!cart.length)
        throw Object.assign(new Error("Your cart is empty"), { status: 400 });
      let total = 0;
      for (const item of cart) {
        if (!item.product.active || item.product.stock < item.quantity)
          throw Object.assign(
            new Error(
              `${item.product.name} is out of stock or has insufficient stock`,
            ),
            { status: 400 },
          );
        total += Number(item.product.price) * item.quantity;
      }
      const created = await tx.order.create({
        data: {
          userId: req.user.id,
          total,
          shippingAddress,
          items: {
            create: cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });
      for (const item of cart) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Order ${created.id}`,
          },
        });
      }
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
      return created;
    });
    res.status(201).json({ success: true, order });
  } catch (e) {
    next(e);
  }
});
router.get("/my", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, orders });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
