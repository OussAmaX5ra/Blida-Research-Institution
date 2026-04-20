import mongoose from "mongoose";

const newsItemSchema = new mongoose.Schema(
  {
    body: {
      type: [String],
      default: [],
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
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    headline: {
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
    teamSlugs: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "news",
    timestamps: true,
  },
);

newsItemSchema.index({ dateIso: -1 });
newsItemSchema.index({ status: 1 });

export const NewsItem =
  mongoose.models.NewsItem ?? mongoose.model("NewsItem", newsItemSchema);
