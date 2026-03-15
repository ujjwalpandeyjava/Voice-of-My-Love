"use client";

import { FileInput, Button, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { TbMusicShare } from "react-icons/tb";
import { MdOutlineImage } from "react-icons/md";

export default function UploadPage() {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Initialize Mantine Form
  const form = useForm({
    initialValues: {
      title: "",
      file: null as File | null,
      thumbnail: null as File | null,
    },
    validate: {
      title: (value) => (value.trim().length === 0 ? "Title is required" : null),
      file: (value) => (!value ? "Music file is required" : null),
      thumbnail: (value) => (!value ? "Thumbnail is required" : null),
    },
  });

  const handleUpload = async (values: typeof form.values) => {
    setMessage("");
    setUploading(true);

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("file", values.file as File);
    formData.append("thumbnail", values.thumbnail as File);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();

      if (res.ok) {
        setMessage(`✅ Uploaded:\n-music: /uploads/${result.fileName}\n-thumbnail: /uploads/${result.thumbnailName}`);
        form.reset(); // Clear the form on success
      } else {
        setMessage(result.error || "Upload failed");
      }
    } catch (error) {
      setMessage("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleUpload)}>
      <Stack>
        <TextInput label="Track Title" placeholder="Enter the title of the music" disabled={uploading} withAsterisk  {...form.getInputProps("title")} maxLength={30} />
        <FileInput leftSection={<TbMusicShare />} placeholder="Pick music file" label="Upload your music file" accept="audio/*" clearable disabled={uploading} withAsterisk  {...form.getInputProps("file")} />
        <FileInput leftSection={<MdOutlineImage />} placeholder="Pick thumbnail image" label="Upload a thumbnail image" accept="image/*" clearable disabled={uploading} withAsterisk  {...form.getInputProps("thumbnail")} />

        <Button type="submit" loading={uploading}>Upload</Button>

        {message && <Text c={message.startsWith("✅") ? "green" : "red"} style={{ whiteSpace: "pre-line" }}>{message}</Text>}
      </Stack>
    </form>
  );
}