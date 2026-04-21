import { readFile } from "node:fs/promises";

import { config as loadEnv } from "dotenv";
loadEnv();

import { connectToDatabase, disconnectFromDatabase } from "../db/mongoose.js";
import { GalleryItem } from "../models/gallery-item.js";
import { Member } from "../models/member.js";
import { NewsItem } from "../models/news-item.js";
import { PhDProgress } from "../models/phd-progress.js";
import { Project } from "../models/project.js";
import { Publication } from "../models/publication.js";
import { SiteConfig } from "../models/site-config.js";
import { Team } from "../models/team.js";

const ENTITY_MODELS = {
  gallery: GalleryItem,
  members: Member,
  news: NewsItem,
  phd_progress: PhDProgress,
  projects: Project,
  publications: Publication,
  teams: Team,
};

function parseArgs(argv) {
  const args = new Map(
    argv
      .slice(2)
      .map((entry) => entry.split("=", 2))
      .filter(([key]) => key.startsWith("--")),
  );

  const filePath = args.get("--file");
  const replace = args.has("--replace");
  return { filePath, replace };
}

async function seedCollection(key, values, { replace }) {
  const model = ENTITY_MODELS[key];
  if (!model || !Array.isArray(values)) {
    return { inserted: 0, name: key };
  }

  if (replace) {
    await model.deleteMany({});
  }

  if (!values.length) {
    return { inserted: 0, name: key };
  }

  const inserted = await model.insertMany(values, { ordered: false });
  return { inserted: inserted.length, name: key };
}

async function seedSiteConfig(siteConfig, { replace }) {
  if (!siteConfig || typeof siteConfig !== "object") {
    return { inserted: 0, name: "siteConfig" };
  }

  if (replace) {
    await SiteConfig.deleteMany({});
  }

  const payload = {
    _id: siteConfig._id ?? "default",
    contactInfo: siteConfig.contactInfo ?? null,
    labInfo: siteConfig.labInfo ?? null,
    researchAxes: siteConfig.researchAxes ?? [],
  };

  await SiteConfig.updateOne({ _id: payload._id }, payload, { upsert: true });
  return { inserted: 1, name: "siteConfig" };
}

async function run() {
  const { filePath, replace } = parseArgs(process.argv);

  if (!filePath) {
    throw new Error(
      [
        "Missing required --file=<path> argument.",
        "Example: npm run seed-content -- --file=./seed-data/content.minimal.json",
        "Or: npm run seed-content:minimal | npm run seed-content:full (both include --replace)",
        "Custom file: append --replace to clear each seeded collection before inserting.",
      ].join("\n"),
    );
  }

  const raw = await readFile(filePath, "utf8");
  const payload = JSON.parse(raw);

  await connectToDatabase();
  try {
    const results = [];
    results.push(await seedSiteConfig(payload.siteConfig, { replace }));

    for (const key of Object.keys(ENTITY_MODELS)) {
      results.push(await seedCollection(key, payload[key], { replace }));
    }

    for (const result of results) {
      console.log(`${result.name}: ${result.inserted}`);
    }
  } finally {
    await disconnectFromDatabase();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
