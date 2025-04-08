import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const hymnsPath = path.join(process.cwd(), "src/app/content/hymns.json");

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
) {
  try {
    const hymn = await request.json();

    // Read the current hymns
    const jsonData = await fs.readFile(hymnsPath, "utf8");
    const data = JSON.parse(jsonData);

    // Update the specific hymn
    const paramsData = await params;
    data.hymns = data.hymns.map((h: any) =>
      h.id === parseInt(paramsData.id) ? hymn : h,
    );

    // Write the updated hymns back to the file
    await fs.writeFile(hymnsPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, data: hymn });
  } catch (error) {
    console.error("Error updating hymn:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hymn" },
      { status: 500 },
    );
  }
}

// Add a GET endpoint to fetch hymns
export async function GET() {
  try {
    const jsonData = await fs.readFile(hymnsPath, "utf8");
    const data = JSON.parse(jsonData);
    return NextResponse.json({ success: true, data: data.hymns });
  } catch (error) {
    console.error("Error reading hymns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read hymns" },
      { status: 500 },
    );
  }
}
