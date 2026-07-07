"use client";

import { useForm } from "@mantine/form";
import Link from "next/link";
import { useRef, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { IoMdMusicalNotes } from "react-icons/io";
import { MdOutlineImage, MdCloudUpload, MdCheckCircle, MdError } from "react-icons/md";
import { TbMusicShare } from "react-icons/tb";

export default function UploadPage() {
	const [message, setMessage] = useState("");
	const [uploading, setUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const musicInputRef = useRef<HTMLInputElement>(null);
	const thumbnailInputRef = useRef<HTMLInputElement>(null);

	const form = useForm({
		initialValues: {
			title: "",
			file: null as File | null,
			thumbnail: null as File | null,
		},
		validate: {
			title: (value) => (value.trim().length === 0 ? "Title is required" : null),
			file: (value) => (!value ? "Music file is required" : null),
		},
	});

	const handleUpload = async (values: typeof form.values) => {
		setMessage("");
		setUploading(true);

		const formData = new FormData();
		formData.append("title", values.title);
		formData.append("file", values.file as File);
		if (values.thumbnail) {
			formData.append("thumbnail", values.thumbnail);
		}

		try {
			const res = await fetch("/api/upload", { method: "POST", body: formData });
			const result = await res.json();

			if (res.ok) {
				const thumbInfo = result.thumbnailName
					? `\n📷 Thumbnail: ${result.thumbnailName}`
					: "\n📷 Thumbnail: default music icon (none uploaded)";
				setMessage(`✅ Track #${result.trackIndex} added!\n🎵 File: ${result.fileName}${thumbInfo}`);
				form.reset();
			} else {
				setMessage(result.error || "Upload failed");
			}
		} catch {
			setMessage("An error occurred during upload.");
		} finally {
			setUploading(false);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile && droppedFile.type.startsWith("audio/")) {
			form.setFieldValue("file", droppedFile);
			if (!form.values.title) {
				form.setFieldValue("title", droppedFile.name.replace(/\.[^.]+$/, ''));
			}
		}
	};

	const isSuccess = message.startsWith("✅");

	return (
		<div className="upload-page">

			{/* Back Button */}
			<Link href="/" className="upload-back-btn">
				<IoArrowBack size={18} />
				<span>Player</span>
			</Link>

			{/* Main Card */}
			<div className="upload-card">
				{/* Header */}
				<div className="upload-card-header">
					<div className="upload-header-icon">
						<MdCloudUpload size={28} />
					</div>
					<h1 className="upload-card-title">Upload Track</h1>
					<p className="upload-card-subtitle">Add a new voice message to your collection</p>
				</div>

				<form onSubmit={form.onSubmit(handleUpload)}>
					{/* Drop Zone */}
					<div
						className={`upload-dropzone ${dragActive ? 'active' : ''} ${form.values.file ? 'has-file' : ''}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() => musicInputRef.current?.click()}
					>
						<input
							ref={musicInputRef}
							type="file"
							accept="audio/*,.mp3,.mpeg,.m4a,.wav,.ogg,.flac,.aac,.wma"
							style={{ display: 'none' }}
							onChange={(e) => {
								const file = e.target.files?.[0] || null;
								form.setFieldValue("file", file);
								if (file && !form.values.title) {
									form.setFieldValue("title", file.name.replace(/\.[^.]+$/, ''));
								}
							}}
							disabled={uploading}
						/>
						{form.values.file ? (
							<>
								<div className="upload-dropzone-icon selected">
									<IoMdMusicalNotes size={28} />
								</div>
								<span className="upload-dropzone-filename">{form.values.file.name}</span>
								<span className="upload-dropzone-hint">Click to change</span>
							</>
						) : (
							<>
								<div className="upload-dropzone-icon">
									<TbMusicShare size={32} />
								</div>
								<span className="upload-dropzone-text">
									{dragActive ? 'Drop it here!' : 'Drag & drop your music file'}
								</span>
								<span className="upload-dropzone-hint">or click to browse</span>
							</>
						)}
					</div>
					{form.errors.file && <span className="upload-field-error">{form.errors.file}</span>}

					{/* Title Input */}
					<div className="upload-field">
						<label className="upload-label">
							Track Title <span className="upload-required">*</span>
						</label>
						<div className="upload-input-wrapper">
							<input
								className="upload-input"
								type="text"
								placeholder="Enter the title of the music"
								maxLength={30}
								disabled={uploading}
								{...form.getInputProps("title")}
							/>
						</div>
						{form.errors.title && <span className="upload-field-error">{form.errors.title}</span>}
					</div>

					{/* Thumbnail Input */}
					<div className="upload-field">
						<label className="upload-label">
							Thumbnail Image
							<span className="upload-optional">optional</span>
						</label>
						<div
							className={`upload-thumbnail-picker ${form.values.thumbnail ? 'has-file' : ''}`}
							onClick={() => thumbnailInputRef.current?.click()}
						>
							<input
								ref={thumbnailInputRef}
								type="file"
								accept="image/*"
								style={{ display: 'none' }}
								onChange={(e) => form.setFieldValue("thumbnail", e.target.files?.[0] || null)}
								disabled={uploading}
							/>
							<MdOutlineImage size={20} className="upload-thumbnail-icon" />
							<span className="upload-thumbnail-text">
								{form.values.thumbnail ? form.values.thumbnail.name : 'Choose cover image'}
							</span>
						</div>
					</div>

					{/* Upload Button */}
					<button
						type="submit"
						className={`upload-submit-btn ${uploading ? 'loading' : ''}`}
						disabled={uploading}
					>
						{uploading ? (
							<>
								<div className="upload-spinner" />
								<span>Uploading...</span>
							</>
						) : (
							<>
								<MdCloudUpload size={20} />
								<span>Upload Track</span>
							</>
						)}
					</button>

					{/* Status Message */}
					{message && (
						<div className={`upload-message ${isSuccess ? 'success' : 'error'}`}>
							{isSuccess ? <MdCheckCircle size={20} /> : <MdError size={20} />}
							<span>{message}</span>
						</div>
					)}
				</form>
			</div>

		</div>
	);
}