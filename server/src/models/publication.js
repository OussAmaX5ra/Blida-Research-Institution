import mongoose from "mongoose";

const publicationSchema = new mongoose.Schema(
  {
    abstract: {
      type: String,
      required: true,
      trim: true,
    },
    authors: {
      type: [String],
      default: [],
    },
    citations: {
      type: Number,
      default: 0,
    },
    doi: {
      type: String,
      required: true,
      trim: true,
    },
    entryType: {
      type: String,
      enum: ["article", "inproceedings"],
      required: true,
    },
    journal: {
      type: String,
      required: true,
      trim: true,
    },
    pdfLink: {
      type: String,
      required: true,
      trim: true,
    },
    publisher: {
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
      required: true,
      trim: true,
    },
    themes: {
      type: [String],
      default: [],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    volume: {
      type: String,
      trim: true,
    },
    issue: {
      type: String,
      trim: true,
    },
    pages: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "publications",
    timestamps: true,
  },
);

publicationSchema.index({ teamSlug: 1, year: -1 });
publicationSchema.index({ publisher: 1 });
publicationSchema.index({ status: 1 });

export const Publication =
  mongoose.models.Publication ?? mongoose.model("Publication", publicationSchema);
