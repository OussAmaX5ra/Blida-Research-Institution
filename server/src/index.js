import { createApp } from "./app.js";
import { connectToDatabase } from "./db/mongoose.js";
import { logError } from "./lib/logger.js";

const app = createApp();

export default async function handler(request, response) {
  try {
    await connectToDatabase();
    return app(request, response);
  } catch (error) {
    logError("serverless:request-init-failed", {
      message: error instanceof Error ? error.stack ?? error.message : String(error),
    });

    response.status(500).json({
      error: {
        code: "API_UNAVAILABLE",
        message: "The API is temporarily unavailable. Please try again shortly.",
      },
    });
  }
}
