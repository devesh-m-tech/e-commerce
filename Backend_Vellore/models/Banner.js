import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    tag: {
      type: String,
      trim: true,
      default: "Exclusive Collection",
    },
    buttonText: {
      type: String,
      trim: true,
      default: "SHOP THE COLLECTION",
    },
    link: {
      type: String,
      trim: true,
      default: "/products",
    },
    imageUrl: {
      type: String,
      required: [true, "Banner image URL is required"],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient sorting by display order
bannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
