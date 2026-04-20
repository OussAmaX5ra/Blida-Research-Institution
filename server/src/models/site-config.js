import mongoose from "mongoose";

const statSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const outreachTrackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const officeHourSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const researchAxisSchema = new mongoose.Schema(
  {
    accent: {
      type: String,
      required: true,
      trim: true,
    },
    id: {
      type: String,
      required: true,
      trim: true,
    },
    methods: {
      type: [String],
      default: [],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    outcomes: {
      type: [String],
      default: [],
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    shortLabel: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    teamAcronyms: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const siteConfigSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: "default",
    },
    contactInfo: {
      campus: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      directions: {
        type: [String],
        default: [],
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      office: {
        type: String,
        required: true,
        trim: true,
      },
      officeHours: {
        type: [officeHourSchema],
        default: [],
      },
      outreachTracks: {
        type: [outreachTrackSchema],
        default: [],
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      responseWindow: {
        type: String,
        required: true,
        trim: true,
      },
    },
    labInfo: {
      acronym: {
        type: String,
        required: true,
        trim: true,
      },
      axes: {
        type: [String],
        default: [],
      },
      founded: {
        type: Number,
        required: true,
      },
      mission: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      stats: {
        type: [statSchema],
        default: [],
      },
      vision: {
        type: String,
        required: true,
        trim: true,
      },
    },
    researchAxes: {
      type: [researchAxisSchema],
      default: [],
    },
  },
  {
    collection: "site_config",
    timestamps: true,
  },
);

export const SiteConfig =
  mongoose.models.SiteConfig ?? mongoose.model("SiteConfig", siteConfigSchema);
