require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const customerPassword = await bcrypt.hash("Customer123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@enterpriseflow.dev" },
    update: {},
    create: {
      name: "Enterprise Admin",
      email: "admin@enterpriseflow.dev",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  await prisma.user.upsert({
    where: { email: "customer@enterpriseflow.dev" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@enterpriseflow.dev",
      password: customerPassword,
    },
  });

  const categories = [
    ["Electronics", "electronics"],
    ["Office", "office"],
    ["Accessories", "accessories"],
    ["Home", "home"],
  ];
  const categoryMap = {};
  for (const [name, slug] of categories) {
    categoryMap[slug] = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  const products = [
    [
      "Studio Headphones",
      "Comfortable over-ear headphones for focused work.",
      89.99,
      24,
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      "electronics",
    ],
    [
      "Wireless Keyboard",
      "Minimal wireless keyboard for a clean desk setup.",
      59.99,
      35,
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
      "accessories",
    ],
    [
      "Desk Lamp",
      "Adjustable warm LED lamp for modern workspaces.",
      42.5,
      18,
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
      "home",
    ],
    [
      "Office Chair",
      "Ergonomic chair designed for everyday productivity.",
      229.0,
      12,
      "https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=900&q=80",
      "office",
    ],
    [
      "Smart Watch",
      "Everyday smart watch with a clean modern design.",
      149.0,
      20,
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      "electronics",
    ],
    [
      "Leather Notebook",
      "Premium notebook for notes, plans and ideas.",
      18.0,
      50,
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80",
      "office",
    ],
  ];
  for (const [name, description, price, stock, imageUrl, slug] of products) {
    const existing = await prisma.product.findFirst({ where: { name } });
    if (!existing)
      await prisma.product.create({
        data: {
          name,
          description,
          price,
          stock,
          imageUrl,
          categoryId: categoryMap[slug].id,
        },
      });
  }
  console.log("Seed complete.");
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
