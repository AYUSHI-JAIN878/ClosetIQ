import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getClothing,
  createClothing,
  addDemoClothing,
  getSingleClothing,
  updateClothing,
  deleteClothing,
  toggleFavorite,
} from "../controllers/clothingController.js";

import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ------------------------------------
// CLOUDINARY STORAGE
// ------------------------------------

const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "closetiq/clothing",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],

    resource_type: "image",
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ------------------------------------
// AUTH
// ------------------------------------

router.use(authMiddleware);

// ------------------------------------
// GET ALL CLOTHES
// ------------------------------------

router.get(
  "/",
  getClothing
);

// ------------------------------------
// ADD CLOTHING WITH IMAGE
// ------------------------------------

router.post(
  "/",
  upload.single("image"),
  createClothing
);

// ------------------------------------
// ADD 12 DEMO CLOTHES
// IMPORTANT: keep this BEFORE /:id
// ------------------------------------

router.post(
  "/demo",
  addDemoClothing
);

// ------------------------------------
// GET SINGLE CLOTHING
// ------------------------------------

router.get(
  "/:id",
  getSingleClothing
);

// ------------------------------------
// UPDATE CLOTHING
// ------------------------------------

router.put(
  "/:id",
  updateClothing
);

// ------------------------------------
// DELETE CLOTHING
// ------------------------------------

router.delete(
  "/:id",
  deleteClothing
);

// ------------------------------------
// FAVORITE
// ------------------------------------

router.patch(
  "/:id/favorite",
  toggleFavorite
);

export default router;