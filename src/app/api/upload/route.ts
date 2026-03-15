import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { readdir } from "fs/promises";
import { extname } from "path";
import { join } from "path";


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
		if (!thumbnail)
			return NextResponse.json({ error: "No thumbnail uploaded." }, { status: 400 });

		const timestamp = Date.now();

		// MUSIC FILE
		const fileExt = file.name.substring(file.name.lastIndexOf('.'));
		const fileBase = file.name.substring(0, file.name.lastIndexOf('.'));
		const finalFileName = `${fileBase}-${timestamp}${fileExt}`;

		const fileBuffer = Buffer.from(await file.arrayBuffer());

		// THUMBNAIL FILE (same basename as audio, append 'tn' before extension)
		const thumbExt = thumbnail.name.substring(thumbnail.name.lastIndexOf('.'));
		// Always use the music file's basename for the thumbnail
		const thumbFileName = `${fileBase}-${timestamp}tn${thumbExt}`;
		const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());

		// Save to /public/uploads (ensure directory exists)
		const uploadDir = join(process.cwd(), "ourFiles", 'uploads');
		await mkdir(uploadDir, { recursive: true });

		await writeFile(join(uploadDir, finalFileName), fileBuffer);
		await writeFile(join(uploadDir, thumbFileName), thumbBuffer);

		return NextResponse.json({
			message: "Files uploaded.",
			fileName: finalFileName,
			thumbnailName: thumbFileName,
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
