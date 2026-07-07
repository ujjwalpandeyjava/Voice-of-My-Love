import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, readFile } from "fs/promises";
import { readdir } from "fs/promises";
import { extname, join } from "path";


export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const title = formData.get("title") as string;
		const file = formData.get("file") as File | null;
		const thumbnail = formData.get("thumbnail") as File | null;

		if (!title)
			return NextResponse.json({ error: "No title provided." }, { status: 400 });
		if (!file)
			return NextResponse.json({ error: "No music file uploaded." }, { status: 400 });

		const timestamp = Date.now();

		// --- Save music file to public/assets/ ---
		const assetsDir = join(process.cwd(), "public", "assets");
		const tnDir = join(process.cwd(), "public", "assets", "tn");
		await mkdir(assetsDir, { recursive: true });
		await mkdir(tnDir, { recursive: true });

		const fileExt = file.name.substring(file.name.lastIndexOf('.'));
		const fileBase = file.name.substring(0, file.name.lastIndexOf('.'));
		const finalFileName = `${fileBase}-${timestamp}${fileExt}`;
		const fileBuffer = Buffer.from(await file.arrayBuffer());
		await writeFile(join(assetsDir, finalFileName), fileBuffer);

		// --- Save thumbnail to public/assets/tn/ (if provided) ---
		let thumbFileName: string | null = null;
		if (thumbnail) {
			const thumbExt = thumbnail.name.substring(thumbnail.name.lastIndexOf('.'));
			thumbFileName = `${fileBase}-${timestamp}tn${thumbExt}`;
			const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());
			await writeFile(join(tnDir, thumbFileName), thumbBuffer);
		}

		// --- Append new track to trackList.ts ---
		const trackListPath = join(process.cwd(), "src", "app", "trackList.ts");
		const trackListContent = await readFile(trackListPath, "utf-8");

		// Determine the next index by counting existing entries
		const indexMatches = trackListContent.match(/index:\s*\d+/g);
		const nextIndex = indexMatches ? indexMatches.length : 0;

		const musicFilePath = `./assets/${finalFileName}`;
		const thumbnailPath = thumbFileName ? `./assets/tn/${thumbFileName}` : "";

		// Build the new track entry
		const newEntry = [
			`\t{`,
			`\t\tindex: ${nextIndex},`,
			`\t\tmusicFile: "${musicFilePath}",`,
			`\t\tthumbnail: "${thumbnailPath}",`,
			`\t\ttitle: "${title.replace(/"/g, '\\"')}"`,
			`\t}`
		].join("\n");

		// Insert the new entry before the closing bracket "]"
		// Find the last '}' before the final ']' and add a comma + new entry
		const lastBraceIndex = trackListContent.lastIndexOf("}");
		if (lastBraceIndex === -1) {
			return NextResponse.json({ error: "Could not parse trackList.ts" }, { status: 500 });
		}

		const updatedContent =
			trackListContent.substring(0, lastBraceIndex + 1) +
			",\n" +
			newEntry +
			"\n" +
			trackListContent.substring(lastBraceIndex + 1);

		await writeFile(trackListPath, updatedContent, "utf-8");

		return NextResponse.json({
			message: "Track uploaded and added to track list.",
			fileName: finalFileName,
			thumbnailName: thumbFileName,
			trackIndex: nextIndex,
		});
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
		return NextResponse.json({
			error: "Failed to upload.",
			errorMessage: errorMessage
		}, { status: 500 });
	}
}


export async function GET() {
	const uploadDir = join(process.cwd(), "ourFiles", "uploads");
	try {
		const files = await readdir(uploadDir);
		// Pair music files with their thumbnails
		const musicFiles = files.filter(name => [".mp3", ".wav", ".m4a", ".flac", ".ogg"].includes(extname(name).toLowerCase()) && !name.includes("tn."));
		const tracks = musicFiles.map(eachMusicFile => {
			const base = eachMusicFile.replace(/\.[^.]+$/, ''); // remove extension
			const thumbnail = files.find((f) => f.startsWith(base) && f.includes("tn."));	// assumes 'tn' before file ext in thumbnail
			return {
				title: eachMusicFile.replace(/-\d+/, "").replace(/\.[^.]+$/, ''), // remove timestamp and extension
				musicFile: `/api/files/uploads/${eachMusicFile}`,
				thumbnail: thumbnail ? `/api/files/uploads/${thumbnail}` : null
			};
		});
		return NextResponse.json(tracks);
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
		return NextResponse.json({
			error: "Could not read upload directory.",
			errorMessage: errorMessage
		}, { status: 500 });
	}
}
