import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
];
const allowedExtensions = [".jpg", ".jpeg", ".png"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const mimeType = (file.mimetype || "").toLowerCase();
  const extension = path.extname(file.originalname || "").toLowerCase();
  const mimeAllowed = allowedMimeTypes.includes(mimeType);
  const extensionAllowed = allowedExtensions.includes(extension);

  if (!mimeAllowed && !extensionAllowed) {
    return cb(new Error("Only JPEG and PNG images are allowed"));
  }
  return cb(null, true);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadSingle = uploader.single("image");
export const uploadMultiple = uploader.array("images", 5);
