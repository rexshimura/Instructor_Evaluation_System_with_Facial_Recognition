// backend/rekognitionClient.js
import { RekognitionClient } from "@aws-sdk/client-rekognition";
import "dotenv/config";

// Credentials are automatically read from .env (AWS_ACCESS_KEY_ID, etc.)
export const rekClient = new RekognitionClient({
    region: process.env.AWS_REGION,
});

// Get the Collection ID from your .env file
export const COLLECTION_ID = process.env.AWS_COLLECTION_ID;

if (!COLLECTION_ID) {
    throw new Error("Missing AWS_COLLECTION_ID from .env file!");
}