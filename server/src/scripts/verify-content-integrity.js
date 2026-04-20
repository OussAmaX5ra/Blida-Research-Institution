/* globals process */
import { connectToDatabase, disconnectFromDatabase } from "../db/mongoose.js";
import { GalleryItem } from "../models/gallery-item.js";
import { Member } from "../models/member.js";
import { NewsItem } from "../models/news-item.js";
import { Project } from "../models/project.js";
import { Publication } from "../models/publication.js";
import { SiteConfig } from "../models/site-config.js";
import { Team } from "../models/team.js";

async function run() {
  await connectToDatabase();
  try {
    const [
      siteConfigCount,
      teamCount,
      memberCount,
      projectCount,
      publicationCount,
      newsCount,
      galleryCount,
    ] = await Promise.all([
      SiteConfig.estimatedDocumentCount(),
      Team.estimatedDocumentCount(),
      Member.estimatedDocumentCount(),
      Project.estimatedDocumentCount(),
      Publication.estimatedDocumentCount(),
      NewsItem.estimatedDocumentCount(),
      GalleryItem.estimatedDocumentCount(),
    ]);

    const report = {
      galleryCount,
      memberCount,
      newsCount,
      projectCount,
      publicationCount,
      siteConfigCount,
      teamCount,
    };

    console.log(JSON.stringify(report, null, 2));

    const hasCoreContent = siteConfigCount > 0 && teamCount > 0;
    if (!hasCoreContent) {
      throw new Error(
        "Content integrity check failed: expected at least one siteConfig and one team record.",
      );
    }
  } finally {
    await disconnectFromDatabase();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
