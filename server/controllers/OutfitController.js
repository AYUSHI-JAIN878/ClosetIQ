import Clothing from "../models/Clothing.js";
import Outfit from "../models/Outfit.js";
import {
  generateOutfitSuggestion,
  generatePackingPlan,
} from "../services/gemini.js";

/*
|--------------------------------------------------------------------------
| GET SAVED OUTFITS
|--------------------------------------------------------------------------
*/

export const getOutfits = async (req, res) => {
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
      message: "Unable to load outfits.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| AI OUTFIT SUGGESTION
|--------------------------------------------------------------------------
*/

export const suggestOutfit = async (req, res) => {
  try {
    const {
      occasion = "Casual",
      weather = "28°C",
    } = req.body;

    /*
     * Get all clothes belonging to logged-in user
     */
    const clothes = await Clothing.find({
      user: req.user._id,
    }).lean();

    if (!clothes.length) {
      return res.status(400).json({
        success: false,
        message:
          "Your closet is empty. Please add some clothes first.",
      });
    }

    /*
     * Send ONLY user's wardrobe to Gemini
     */
    const wardrobe = clothes.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      category: item.category,
      color: item.color,
      occasion: item.occasion,
      imageUrl: item.imageUrl,
    }));

    const result = await generateOutfitSuggestion({
      wardrobe,
      occasion,
      weather,
    });

    /*
     * Gemini service should return an object.
     * We make sure the returned items match
     * actual wardrobe items.
     */

    let parsed = result;

    if (typeof result === "string") {
      const cleaned = result
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      try {
        parsed = JSON.parse(cleaned);
      } catch (error) {
        console.error(
          "Gemini outfit JSON parse error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "AI returned an invalid outfit response.",
        });
      }
    }

    if (!parsed || !Array.isArray(parsed.items)) {
      return res.status(500).json({
        success: false,
        message:
          "AI could not create a valid outfit.",
      });
    }

    /*
     * Match AI returned items with actual wardrobe items.
     */

    const finalItems = [];

    for (const aiItem of parsed.items) {
      const aiId = aiItem.id
        ? String(aiItem.id)
        : "";

      const aiName = String(
        aiItem.name || ""
      )
        .trim()
        .toLowerCase();

      let matchedItem = null;

      /*
       * First try ID match
       */
      if (aiId) {
        matchedItem = clothes.find(
          (item) =>
            String(item._id) === aiId
        );
      }

      /*
       * If ID doesn't match,
       * try name match.
       */
      if (!matchedItem && aiName) {
        matchedItem = clothes.find(
          (item) =>
            String(item.name || "")
              .trim()
              .toLowerCase() === aiName
        );
      }

      /*
       * If still not found,
       * try partial name match.
       */
      if (!matchedItem && aiName) {
        matchedItem = clothes.find(
          (item) =>
            aiName.includes(
              String(item.name || "")
                .trim()
                .toLowerCase()
            ) ||
            String(item.name || "")
              .trim()
              .toLowerCase()
              .includes(aiName)
        );
      }

      if (matchedItem) {
        finalItems.push({
          id: matchedItem._id.toString(),
          name: matchedItem.name,
          category: matchedItem.category,
          color: matchedItem.color,
          imageUrl: matchedItem.imageUrl,
        });
      }
    }

    /*
     * If Gemini returned nothing that matches
     * the actual closet, create a fallback outfit
     * from available wardrobe items.
     */

    if (!finalItems.length) {
      const categoryOrder = [
        "Top",
        "Tops",
        "Shirt",
        "T-Shirt",
        "Bottom",
        "Bottoms",
        "Pants",
        "Jeans",
        "Dress",
        "Shoes",
        "Footwear",
        "Accessory",
      ];

      const fallbackItems = [];

      for (const category of categoryOrder) {
        const found = clothes.find(
          (item) =>
            String(item.category || "")
              .toLowerCase() ===
            category.toLowerCase()
        );

        if (
          found &&
          !fallbackItems.some(
            (item) =>
              String(item._id) ===
              String(found._id)
          )
        ) {
          fallbackItems.push(found);
        }

        if (fallbackItems.length >= 4) {
          break;
        }
      }

      /*
       * If categories don't match our list,
       * simply use first available clothes.
       */
      if (!fallbackItems.length) {
        fallbackItems.push(
          ...clothes.slice(0, 4)
        );
      }

      finalItems.push(
        ...fallbackItems.map((item) => ({
          id: item._id.toString(),
          name: item.name,
          category: item.category,
          color: item.color,
          imageUrl: item.imageUrl,
        }))
      );
    }

    return res.json({
      success: true,
      result: JSON.stringify({
        title:
          parsed.title ||
          `${occasion} Outfit`,
        items: finalItems,
        reason:
          parsed.reason ||
          `A ${occasion.toLowerCase()} look created from your existing wardrobe.`,
      }),
    });
  } catch (error) {
    console.error(
      "AI outfit suggestion error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to generate outfit suggestion.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SAVE OUTFIT
|--------------------------------------------------------------------------
*/

export const createOutfit = async (req, res) => {
  try {
    const {
      title,
      items,
      occasion,
      reason,
    } = req.body;

    if (
      !Array.isArray(items) ||
      !items.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide at least one clothing item.",
      });
    }

    /*
     * Make sure items actually belong
     * to the logged-in user's closet.
     */
    const validItems = await Clothing.find({
      _id: { $in: items },
      user: req.user._id,
    });

    if (!validItems.length) {
      return res.status(400).json({
        success: false,
        message:
          "No valid wardrobe items were found.",
      });
    }

    const outfit = await Outfit.create({
      user: req.user._id,
      title:
        title ||
        `${occasion || "Casual"} Outfit`,
      items: validItems.map(
        (item) => item._id
      ),
      occasion:
        occasion || "Casual",
      reason: reason || "",
    });

    const populatedOutfit =
      await Outfit.findById(
        outfit._id
      ).populate("items");

    return res.status(201).json({
      success: true,
      message: "Outfit saved successfully.",
      outfit: populatedOutfit,
    });
  } catch (error) {
    console.error(
      "Create outfit error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save outfit.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE OUTFIT
|--------------------------------------------------------------------------
*/

export const deleteOutfit = async (
  req,
  res
) => {
  try {
    const outfit =
      await Outfit.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: "Outfit not found.",
      });
    }

    return res.json({
      success: true,
      message: "Outfit deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete outfit error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete outfit.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| TOGGLE FAVORITE OUTFIT
|--------------------------------------------------------------------------
*/

export const toggleFavorite = async (
  req,
  res
) => {
  try {
    const outfit =
      await Outfit.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: "Outfit not found.",
      });
    }

    outfit.favorite =
      !outfit.favorite;

    await outfit.save();

    return res.json({
      success: true,
      favorite: outfit.favorite,
      outfit,
    });
  } catch (error) {
    console.error(
      "Toggle outfit favorite error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update favorite.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| AI PACKING PLAN
|--------------------------------------------------------------------------
*/

export const createPackingPlan =
  async (req, res) => {
    try {
      const {
        destination,
        days,
        occasion = "Mixed",
      } = req.body;

      if (!destination?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a destination.",
        });
      }

      if (!days || Number(days) < 1) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid number of days.",
        });
      }

      const clothes =
        await Clothing.find({
          user: req.user._id,
        }).lean();

      if (!clothes.length) {
        return res.status(400).json({
          success: false,
          message:
            "Your closet is empty. Add some clothes first.",
        });
      }

      const wardrobe = clothes.map(
        (item) => ({
          id: item._id.toString(),
          name: item.name,
          category: item.category,
          color: item.color,
          occasion: item.occasion,
        })
      );

      const result =
        await generatePackingPlan({
          wardrobe,
          destination:
            destination.trim(),
          days: Number(days),
          occasion,
        });

      return res.json({
        success: true,
        result:
          typeof result === "string"
            ? result
            : JSON.stringify(result),
      });
    } catch (error) {
      console.error(
        "Packing plan error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to create packing plan.",
      });
    }
  };