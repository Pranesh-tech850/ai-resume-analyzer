// MongoDB connection. Returns null when MONGODB_URI is not set, so the server still runs
// without a database and only the save endpoint reports that storage is off.
import { MongoClient } from "mongodb";

let db = null;

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI is not set. Analyses will not be saved.");
    return null;
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();

  db = client.db(process.env.MONGODB_DB || "resume_parser");
  // Newest-first queries (for a history page) stay fast as the collection grows.
  await db.collection("analyses").createIndex({ createdAt: -1 });

  console.log(`Connected to MongoDB database "${db.databaseName}".`);
  return db;
}

export function getDb() {
  return db;
}
