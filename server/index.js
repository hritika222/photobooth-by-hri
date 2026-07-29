import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");
const uploadDir = path.join(__dirname, "uploads");
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "gallery.json");

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]");

const app = express();
const PORT = Number(process.env.PORT || 5050);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-this-password";
const maxMb = Number(process.env.MAX_UPLOAD_MB || 12);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${crypto.randomUUID()}.jpg`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: maxMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype === "image/jpeg" || file.mimetype === "image/png")
});

function readGallery() {
  try { return JSON.parse(fs.readFileSync(dataFile, "utf8")); }
  catch { return []; }
}
function writeGallery(items) {
  fs.writeFileSync(dataFile, JSON.stringify(items, null, 2));
}
function adminOnly(req, res, next) {
  if (req.header("x-admin-password") !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  next();
}

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "Photobooth by Hri" }));

app.post("/api/gallery", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded." });
  let meta = {};
  try { meta = JSON.parse(req.body.meta || "{}"); } catch {}
  const item = {
    id: crypto.randomUUID(),
    url: `/uploads/${req.file.filename}`,
    createdAt: new Date().toISOString(),
    frame: meta.frame || "unknown",
    stickers: Array.isArray(meta.stickers) ? meta.stickers.slice(0, 6) : []
  };
  const gallery = readGallery();
  gallery.unshift(item);
  writeGallery(gallery);
  res.status(201).json(item);
});

app.get("/api/gallery", adminOnly, (_req, res) => res.json(readGallery()));

app.delete("/api/gallery/:id", adminOnly, (req, res) => {
  const gallery = readGallery();
  const item = gallery.find((photo) => photo.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  const filename = path.basename(item.url);
  const file = path.join(uploadDir, filename);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  writeGallery(gallery.filter((photo) => photo.id !== req.params.id));
  res.json({ ok: true });
});

app.use(express.static(path.join(root, "dist")));
app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
  const index = path.join(root, "dist", "index.html");
  if (fs.existsSync(index)) res.sendFile(index);
  else res.status(404).send("Build the Vite app first with npm run build.");
});

app.listen(PORT, () => console.log(`Photobooth by Hri server running on http://localhost:${PORT}`));
