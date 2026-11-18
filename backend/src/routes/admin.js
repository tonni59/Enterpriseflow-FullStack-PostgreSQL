const router = require("express").Router();
const prisma = require("../utils/prisma");
const { protect, adminOnly } = require("../middleware/auth");
router.use(protect, adminOnly);

router.get("/stats", async (req, res, next) => {
  try {
    const [products, users, orders, revenue, recentOrders, lowStock] =
      await Promise.all([
        prisma.product.count({ where: { active: true } }),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: "CANCELLED" } },
        }),
        prisma.order.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, email: true } },
            items: true,
          },
        }),
        prisma.product.findMany({
          where: { active: true, stock: { lte: 8 } },
          take: 8,
          orderBy: { stock: "asc" },
        }),
      ]);
    const grouped = await prisma.order.groupBy({
      by: ["createdAt"],
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    });
    res.json({
      success: true,
      stats: {
        products,
        users,
        orders,
        revenue: Number(revenue._sum.total || 0),
        recentOrders,
        lowStock,
        sales: grouped
          .slice(-7)
          .map((x) => ({
            date: x.createdAt.toISOString().slice(0, 10),
            revenue: Number(x._sum.total || 0),
          })),
      },
    });
  } catch (e) {
    next(e);
  }
});
router.get("/orders", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, orders });
  } catch (e) {
    next(e);
  }
});
router.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const allowed = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    const status = String(req.body.status || "").toUpperCase();
    if (!allowed.includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status" });
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true, order });
  } catch (e) {
    next(e);
  }
});
router.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, users });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
