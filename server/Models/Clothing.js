import mongoose from "mongoose";

const clothingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Tops", "Jeans", "Dresses", "Shoes", "Accessories"],
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    occasion: {
      type: String,
      required: true,
      enum: ["Casual", "College", "Party", "Formal"],
    },

    imageUrl: {
      type: String,
      required: true,
    },

    favorite: {
      type: Boolean,
      default: false,
    },

    lastWorn: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Clothing = mongoose.model("Clothing", clothingSchema);

export default Clothing;