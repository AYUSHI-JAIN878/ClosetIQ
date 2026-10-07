import Clothing from "../models/Clothing.js";

// ------------------------------------
// GET ALL CLOTHING
// ------------------------------------

export const getClothing = async (req, res) => {
  try {
    const clothing = await Clothing.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      clothing,
    });
  } catch (error) {
    console.error("Get clothing error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch clothing.",
    });
  }
};

// ------------------------------------
// CREATE CLOTHING
// ------------------------------------

export const createClothing = async (req, res) => {
  try {
    const {
      name,
      category,
      color,
      occasion,
    } = req.body;

    if (
      !name ||
      !category ||
      !color ||
      !occasion
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all clothing details.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a clothing photo.",
      });
    }

    const clothing = await Clothing.create({
      user: req.user._id,
      name: name.trim(),
      category,
      color: color.trim(),
      occasion,
      imageUrl: req.file.path,
    });

    return res.status(201).json({
      success: true,
      message:
        "Clothing added successfully.",
      clothing,
    });
  } catch (error) {
    console.error(
      "Create clothing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add clothing.",
    });
  }
};

// ------------------------------------
// ADD DEMO CLOTHES
// ------------------------------------

export const addDemoClothing = async (
  req,
  res
) => {
  try {
    const demoClothes = [
      {
        name: "White Oversized T-Shirt",
        category: "Tops",
        color: "White",
        occasion: "Casual",
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "Black Basic T-Shirt",
        category: "Tops",
        color: "Black",
        occasion: "College",
        imageUrl:
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "Blue Straight Jeans",
        category: "Jeans",
        color: "Blue",
        occasion: "Casual",
        imageUrl:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "Light Blue Mom Jeans",
        category: "Jeans",
        color: "Light Blue",
        occasion: "College",
        imageUrl:
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "Beige Cargo Pants",
        category: "Jeans",
        color: "Beige",
        occasion: "Casual",
        imageUrl:
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "White Formal Shirt",
        category: "Tops",
        color: "White",
        occasion: "Formal",
        imageUrl:
          "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "Pink Summer Dress",
        category: "Dresses",
        color: "Pink",
        occasion: "Party",
        imageUrl:
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "Black Party Dress",
        category: "Dresses",
        color: "Black",
        occasion: "Party",
        imageUrl:
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "White Sneakers",
        category: "Shoes",
        color: "White",
        occasion: "College",
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "Black Loafers",
        category: "Shoes",
        color: "Black",
        occasion: "Formal",
        imageUrl:
          "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "Blue Denim Jacket",
        category: "Tops",
        color: "Blue",
        occasion: "Casual",
        imageUrl:
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85",
      },

      {
        name: "Pearl Necklace",
        category: "Accessories",
        color: "White",
        occasion: "Party",
        imageUrl:
          "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=85",
      },
    ];

    // Check which demo clothes already exist
    const existingClothes =
      await Clothing.find({
        user: req.user._id,
        name: {
          $in: demoClothes.map(
            (item) => item.name
          ),
        },
      }).select("name");

    const existingNames = new Set(
      existingClothes.map(
        (item) => item.name
      )
    );

    // Only add clothes that don't already exist
    const clothesToAdd =
      demoClothes
        .filter(
          (item) =>
            !existingNames.has(item.name)
        )
        .map((item) => ({
          user: req.user._id,
          name: item.name,
          category: item.category,
          color: item.color,
          occasion: item.occasion,
          imageUrl: item.imageUrl,
          favorite: false,
        }));

    if (clothesToAdd.length === 0) {
      return res.json({
        success: true,
        message:
          "Demo clothes are already added.",
        added: 0,
      });
    }

    const createdClothes =
      await Clothing.insertMany(
        clothesToAdd
      );

    return res.status(201).json({
      success: true,
      message:
        `${createdClothes.length} demo clothes added successfully.`,
      added: createdClothes.length,
      clothing: createdClothes,
    });
  } catch (error) {
    console.error(
      "Add demo clothing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add demo clothes.",
    });
  }
};

// ------------------------------------
// GET SINGLE CLOTHING
// ------------------------------------

export const getSingleClothing = async (
  req,
  res
) => {
  try {
    const clothing =
      await Clothing.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!clothing) {
      return res.status(404).json({
        success: false,
        message:
          "Clothing item not found.",
      });
    }

    return res.json({
      success: true,
      clothing,
    });
  } catch (error) {
    console.error(
      "Get single clothing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch clothing item.",
    });
  }
};

// ------------------------------------
// UPDATE CLOTHING
// ------------------------------------

export const updateClothing = async (
  req,
  res
) => {
  try {
    const clothing =
      await Clothing.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!clothing) {
      return res.status(404).json({
        success: false,
        message:
          "Clothing item not found.",
      });
    }

    return res.json({
      success: true,
      message:
        "Clothing updated successfully.",
      clothing,
    });
  } catch (error) {
    console.error(
      "Update clothing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update clothing.",
    });
  }
};

// ------------------------------------
// DELETE CLOTHING
// ------------------------------------

export const deleteClothing = async (
  req,
  res
) => {
  try {
    const clothing =
      await Clothing.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!clothing) {
      return res.status(404).json({
        success: false,
        message:
          "Clothing item not found.",
      });
    }

    return res.json({
      success: true,
      message:
        "Clothing deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete clothing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete clothing.",
    });
  }
};

// ------------------------------------
// TOGGLE FAVORITE
// ------------------------------------

export const toggleFavorite = async (
  req,
  res
) => {
  try {
    const clothing =
      await Clothing.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!clothing) {
      return res.status(404).json({
        success: false,
        message:
          "Clothing item not found.",
      });
    }

    clothing.favorite =
      !clothing.favorite;

    await clothing.save();

    return res.json({
      success: true,
      message: clothing.favorite
        ? "Added to favorites."
        : "Removed from favorites.",
      clothing,
    });
  } catch (error) {
    console.error(
      "Favorite error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update favorite.",
    });
  }
};