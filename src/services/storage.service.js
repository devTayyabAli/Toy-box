const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const cloudinary = require("cloudinary").v2;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VEHICLE_DOC_ALLOWED = new Set([
  ...ALLOWED,
  "application/pdf",
]);

function extFromMime(mimetype) {
  if (mimetype === "image/png") return "png";
  if (mimetype === "image/webp") return "webp";
  if (mimetype === "image/gif") return "gif";
  if (mimetype === "application/pdf") return "pdf";
  return "jpg";
}

function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    return true;
  }
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    return true;
  }
  return false;
}

async function uploadLocal({ buffer, mimetype, subfolder = "avatars" }) {
  const ext = extFromMime(mimetype);
  const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "uploads", subfolder);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, buffer);
  const base = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
  const rel = `/uploads/${subfolder}/${name}`;
  return { url: base ? `${base}${rel}` : rel, provider: "local", key: rel };
}

async function uploadS3({ buffer, mimetype, subfolder = "avatars" }) {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET;
  if (!region || !bucket) {
    throw new Error("S3 upload requires AWS_REGION and S3_BUCKET");
  }
  const ext = extFromMime(mimetype);
  const key = `${subfolder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const client = new S3Client({ region });
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    }),
  );
  const base =
    process.env.S3_PUBLIC_BASE_URL ||
    `https://${bucket}.s3.${region}.amazonaws.com`;
  const url = `${base.replace(/\/$/, "")}/${key}`;
  return { url, provider: "s3", key };
}

async function uploadCloudinary({ buffer, mimetype, folder }) {
  if (!configureCloudinary()) {
    throw new Error("Cloudinary requires CLOUDINARY_URL or CLOUDINARY_* env vars");
  }
  const uploadFolder = folder || process.env.CLOUDINARY_FOLDER || "toybox/avatars";
  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: uploadFolder,
    resource_type: "image",
  });
  return { url: result.secure_url, provider: "cloudinary", key: result.public_id };
}

async function uploadImage(file, subfolder) {
  if (!file?.buffer?.length) {
    throw new Error("Empty file");
  }
  if (!ALLOWED.has(file.mimetype)) {
    throw new Error("Unsupported image type");
  }

  const provider = (process.env.UPLOAD_PROVIDER || "local").toLowerCase();

  if (provider === "s3") {
    return uploadS3({ ...file, subfolder });
  }
  if (provider === "cloudinary") {
    const folder =
      subfolder === "covers"
        ? process.env.CLOUDINARY_COVERS_FOLDER || "toybox/covers"
        : process.env.CLOUDINARY_FOLDER || "toybox/avatars";
    return uploadCloudinary({ ...file, folder });
  }
  return uploadLocal({ ...file, subfolder });
}

/**
 * @param {{ buffer: Buffer, mimetype: string, originalName?: string }} file
 * @returns {Promise<{ url: string, provider: string, key?: string }>}
 */
async function uploadProfileImage(file) {
  return uploadImage(file, "avatars");
}

async function uploadCoverImage(file) {
  return uploadImage(file, "covers");
}

/**
 * @param {{ buffer: Buffer, mimetype: string, originalName?: string }} file
 */
async function uploadVehicleDocument(file) {
  if (!file?.buffer?.length) {
    throw new Error("Empty file");
  }
  if (!VEHICLE_DOC_ALLOWED.has(file.mimetype)) {
    throw new Error("Unsupported document type. Use JPEG, PNG, WebP, GIF, or PDF.");
  }

  const provider = (process.env.UPLOAD_PROVIDER || "local").toLowerCase();

  if (provider === "s3") {
    const ext = extFromMime(file.mimetype);
    const key = `vehicles/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET;
    if (!region || !bucket) {
      throw new Error("S3 upload requires AWS_REGION and S3_BUCKET");
    }
    const client = new S3Client({ region });
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    const base =
      process.env.S3_PUBLIC_BASE_URL ||
      `https://${bucket}.s3.${region}.amazonaws.com`;
    const url = `${base.replace(/\/$/, "")}/${key}`;
    return { url, provider: "s3", key };
  }

  if (provider === "cloudinary") {
    if (!configureCloudinary()) {
      throw new Error("Cloudinary requires CLOUDINARY_URL or CLOUDINARY_* env vars");
    }
    const folder = process.env.CLOUDINARY_VEHICLE_FOLDER || "toybox/vehicles";
    const resourceType = file.mimetype === "application/pdf" ? "raw" : "image";
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: resourceType,
    });
    return { url: result.secure_url, provider: "cloudinary", key: result.public_id };
  }

  return uploadLocal({ ...file, subfolder: "vehicles" });
}

module.exports = {
  uploadProfileImage,
  uploadCoverImage,
  uploadVehicleDocument,
  ALLOWED,
  VEHICLE_DOC_ALLOWED,
};
