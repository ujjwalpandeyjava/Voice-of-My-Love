"use client";


import { FileInput, Button, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { TbMusicShare } from "react-icons/tb";
import { MdOutlineImage } from "react-icons/md";



export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Please select a music file.");
      return;
    }
    if (!thumbnail) {
      setMessage("Please select a thumbnail image."); ``
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("thumbnail", thumbnail);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const result = await res.json();
    setUploading(false);

    if (res.ok)
      setMessage(`✅ Uploaded:\n-music: /uploads/${result.fileName}\n-thumbnail: /uploads/${result.thumbnailName}`);
    else
      setMessage(result.error || "Upload failed");
  };

  return (
    <form onSubmit={handleUpload}>
      <Stack>
        <FileInput leftSection={<TbMusicShare />} placeholder="Pick music file" label="Upload your music file" accept="audio/*" value={file} onChange={setFile} clearable disabled={uploading} />
        <FileInput leftSection={<MdOutlineImage />} placeholder="Pick thumbnail image" label="Upload a thumbnail image" accept="image/*" value={thumbnail} onChange={setThumbnail} clearable disabled={uploading} />
        <Button type="submit" loading={uploading}>Upload</Button>
        {message && <Text c={message.startsWith("✅") ? "green" : "red"} style={{ whiteSpace: "pre-line" }}>{message}</Text>}
      </Stack>
    </form>
  );
}
