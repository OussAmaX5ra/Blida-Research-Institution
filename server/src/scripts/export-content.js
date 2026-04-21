import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { connectToDatabase, disconnectFromDatabase } from "../db/mongoose.js";
import { GalleryItem } from "../models/gallery-item.js";
import { Member } from "../models/member.js";
import { NewsItem } from "../models/news-item.js";
import { Project } from "../models/project.js";
import { Publication } from "../models/publication.js";
import { SiteConfig } from "../models/site-config.js";
import { Team } from "../models/team.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = new Map(
    argv
      .slice(2)
      .map((entry) => entry.split("=", 2))
      .filter(([key]) => key.startsWith("--")),
  );
  const out = args.get("--out") ?? "./seed-data/content.exported.json";
  return { outPath: resolve(process.cwd(), out) };
}

function stripMongo(doc) {
  if (!doc || typeof doc !== "object") {
    return doc;
  }
  const next = { ...doc };
  delete next.__v;
  delete next.createdAt;
  delete next.updatedAt;
  if (next._id !== undefined && next._id !== null) {
    next._id = String(next._id);
  }
  return next;
}

async function run() {
  const { outPath } = parseArgs(process.argv);

  await connectToDatabase();
  try {
    const [siteConfig, teams, members, projects, publications, news, gallery] = await Promise.all([
      SiteConfig.findById("default").lean(),
      Team.find().sort({ name: 1 }).lean(),
      Member.find().sort({ name: 1 }).lean(),
      Project.find().sort({ year: -1, title: 1 }).lean(),
      Publication.find().sort({ year: -1, title: 1 }).lean(),
      NewsItem.find().sort({ dateIso: -1, headline: 1 }).lean(),
      GalleryItem.find().sort({ dateIso: -1, title: 1 }).lean(),
    ]);

    const payload = {
      siteConfig: siteConfig ? stripMongo(siteConfig) : null,
      teams: teams.map(stripMongo),
      members: members.map(stripMongo),
      projects: projects.map(stripMongo),
      publications: publications.map(stripMongo),
      news: news.map(stripMongo),
      gallery: gallery.map(stripMongo),
    };

    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Wrote ${outPath}`);
    console.log(
      JSON.stringify(
        {
          gallery: payload.gallery.length,
          members: payload.members.length,
          news: payload.news.length,
          projects: payload.projects.length,
          publications: payload.publications.length,
          siteConfig: Boolean(payload.siteConfig),
          teams: payload.teams.length,
        },
        null,
        2,
      ),
    );
  } finally {
    await disconnectFromDatabase();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
