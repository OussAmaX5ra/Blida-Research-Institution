import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    dateIso: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Review", "Published"],
      default: "Published",
      required: true,
    },
    teamSlug: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: "gallery",
    timestamps: true,
  },
);

galleryItemSchema.index({ dateIso: -1 });
galleryItemSchema.index({ status: 1 });

export const GalleryItem =
  mongoose.models.GalleryItem ?? mongoose.model("GalleryItem", galleryItemSchema);
