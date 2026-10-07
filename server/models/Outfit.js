import mongoose from "mongoose";

const outfitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clothing",
      },
    ],

    occasion: {
      type: String,
      default: "Casual",
    },

    reason: {
      type: String,
      default: "",
    },

    favorite: {
      type: Boolean,
      default: false,
    },

    wornDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Outfit = mongoose.model("Outfit", outfitSchema);

export default Outfit;