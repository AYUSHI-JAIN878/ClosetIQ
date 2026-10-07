import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import Clothing from "../models/Clothing.js";
import Outfit from "../models/Outfit.js";

import {
  suggestOutfit,
  styleClothing,
  createPackingPlan,
} from "../services/geminiService.js";

const router = express.Router();

router.use(authMiddleware);

// GET ALL SAVED OUTFITS
router.get("/", async (req, res) => {
  try {
    const outfits = await Outfit.find({
      user: req.user._id,
    })
      .populate("items")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      outfits,
    });
  } catch (error) {
    console.error("Get outfits error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch outfits.",
    });
  }
});

// AI OUTFIT SUGGESTION
router.post("/ai/suggest", async (req, res) => {
  try {
    const { occasion, weather } = req.body;

    const clothing = await Clothing.find({
      user: req.user._id,
    });

    if (clothing.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please add some clothes to your closet first.",
      });
    }

    const result = await suggestOutfit({
      clothing,
      occasion,
      weather,
    });

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("AI outfit error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to generate outfit suggestion.",
    });
  }
});

// AI STYLE SELECTED CLOTHING
router.post("/ai/style-item", async (req, res) => {
  try {
    const {
      clothingId,
      occasion,
      weather,
    } = req.body;

    if (!clothingId) {
      return res.status(400).json({
        success: false,
        message: "Clothing item is required.",
      });
    }

    const clothing = await Clothing.find({
      user: req.user._id,
    });

    const selectedItem = clothing.find(
      (item) =>
        item._id.toString() ===
        clothingId.toString()
    );

    if (!selectedItem) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found.",
      });
    }

    const result = await styleClothing({
      clothing,
      selectedItem,
      occasion,
      weather,
    });

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "AI style item error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to style this clothing item.",
    });
  }
});

// AI PACKING PLANNER
router.post("/ai/packing", async (req, res) => {
  try {
    const {
      destination,
      days,
      occasion,
    } = req.body;

    if (!destination || !days) {
      return res.status(400).json({
        success: false,
        message:
          "Destination and number of days are required.",
      });
    }

    const clothing = await Clothing.find({
      user: req.user._id,
    });

    if (clothing.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please add clothes to your closet first.",
      });
    }

    const result = await createPackingPlan({
      clothing,
      destination,
      days,
      occasion,
    });

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "AI packing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create packing plan.",
    });
  }
});

// SAVE OUTFIT
router.post("/", async (req, res) => {
  try {
    const {
      title,
      items,
      occasion,
      reason,
    } = req.body;

    if (!title || !items?.length) {
      return res.status(400).json({
        success: false,
        message:
          "Outfit title and items are required.",
      });
    }

    const validItems = await Clothing.find({
      _id: { $in: items },
      user: req.user._id,
    });

    if (validItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more clothing items are invalid.",
      });
    }

    const outfit = await Outfit.create({
      user: req.user._id,
      title,
      items,
      occasion,
      reason,
    });

    const savedOutfit =
      await Outfit.findById(outfit._id)
        .populate("items");

    return res.status(201).json({
      success: true,
      message: "Outfit saved successfully.",
      outfit: savedOutfit,
    });
  } catch (error) {
    console.error("Save outfit error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save outfit.",
    });
  }
});

export default router;