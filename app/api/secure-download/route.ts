import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("file");

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
  }

  try {
    // 1. Fetch the file from the external host (UploadThing)
    const response = await fetch(fileUrl);
    
    if (!response.ok) throw new Error("File source not found");

    // 2. Stream it to the user with attachment headers (Forces Download instead of viewing)
    const contentType = response.headers.get("content-type") || "application/pdf";
    
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    
    // Create a clean filename
    const cleanName = "Collins_Academy_Secure_PDF.pdf";
    headers.set("Content-Disposition", `attachment; filename="${cleanName}"`);

    return new NextResponse(response.body, {
        status: 200,
        headers,
    });

  } catch (error) {
    console.error("Secure Download Error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}