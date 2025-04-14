import { hymns } from "@/content/hymns";
import { promises as fs } from "fs";
import path from "path";

async function initHymnsJson() {
  const hymnsPath = path.join(process.cwd(), "src/content/hymns.json");
  const data = { hymns };

  try {
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(hymnsPath, jsonContent);
    console.log("Successfully created hymns.json");
  } catch (error) {
    console.error("Error creating hymns.json:", error);
  }
}

initHymnsJson();
