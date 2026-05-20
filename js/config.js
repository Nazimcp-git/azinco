/**
 * ========================================
 * Azinco Interiors — Configuration
 * ========================================
 * ImageKit + JSONBin settings.
 *
 * HOW TO GET THESE VALUES:
 *
 * 1. ImageKit:
 *    - Sign up at https://imagekit.io (free tier)
 *    - Go to Dashboard → Developer Options
 *    - Copy your Public Key and URL Endpoint
 *    - Create a restricted Private Key (upload-only)
 *
 * 2. JSONBin:
 *    - Sign up at https://jsonbin.io (free tier)
 *    - Create a new bin with content: []
 *    - Copy your Bin ID and Master Key
 *    - Paste them below
 *
 * ⚠️ IMPORTANT: Replace JSONBIN_BIN_ID below with your
 *    actual Bin ID from jsonbin.io before uploading products!
 */

var CONFIG = {
  // ── ImageKit ───────────────────────────
  IMAGEKIT_PUBLIC_KEY: "public_x8uDMJT4JvZWLZcnkjU6ZPzlGAw=",
  IMAGEKIT_PRIVATE_KEY: "private_IYVir0LN50XYY5aoO5omtBD/gdE=",
  IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/ajtjz9iiv",
  IMAGEKIT_UPLOAD_URL: "https://upload.imagekit.io/api/v1/files/upload",
  IMAGEKIT_FOLDER: "/azinco-products",

  // ── JSONBin ────────────────────────────
  // ⚠️ Replace this with your real Bin ID from jsonbin.io
  JSONBIN_BIN_ID: "6a034abcadc21f119a8cec77",
  JSONBIN_MASTER_KEY: "$2a$10$Na4tsbubHQJjLxrlY3oG9uOPsVpqjo/IDlHZjfAAoCnDMLhANrNWy",
  JSONBIN_API_URL: "https://api.jsonbin.io/v3",

  // ── Admin Password ─────────────────────
  // SHA-256 hash of your admin password
  // Generate at: https://emn178.github.io/online-tools/sha256.html
  ADMIN_PASSWORD_HASH: "3b9097fd6b2af7c51ae8c5931f3b660ca7f3d7417f77e50b1b897bab2f8455f0",

  // ── Pagination ─────────────────────────
  PAGE_SIZE: 6,

  // ── Upload Limits ──────────────────────
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],

  // ── Image Compression ─────────────────
  COMPRESS_MAX_WIDTH: 1600,
  COMPRESS_QUALITY: 0.82,
};
