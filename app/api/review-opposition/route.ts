import { NextApiRequest, NextApiResponse } from "next";
import { reviewOpposition } from "@/server/actions/oppositions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    console.log("API Request Body:", req.body);

    const { oppositionId, decision, reviewNotes } = req.body;

    // Validate required fields
    if (!oppositionId || !decision) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const result = await reviewOpposition(
      Number(oppositionId),
      decision,
      reviewNotes
    );

    console.log("API Result:", result);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error("API error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
