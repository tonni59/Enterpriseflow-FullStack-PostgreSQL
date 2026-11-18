require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { notFound, errorHandler } = require("./middleware/error");
const { protect, adminOnly } = require("./middleware/auth");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "EnterpriseFlow API is running" }),
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));

const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "")}`,
    ),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});
app.post(
  "/api/uploads",
  protect,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    res
      .status(201)
      .json({
        success: true,
        url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      });
  },
);
app.use("/uploads", express.static(uploadDir));
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`EnterpriseFlow API listening on http://localhost:${port}`),
);
