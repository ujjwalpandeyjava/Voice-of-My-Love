"use client";

import { Track } from "@/interfaces/ourInterfaces";
import { Button, Card, CardSection, Center, Flex, Group, Image, Modal, Progress, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useRef, useState } from "react";
import { CiPause1, CiPlay1 } from "react-icons/ci";
import { FaForward } from 'react-icons/fa';
import { IoMdMusicalNotes } from "react-icons/io";
import { MdOutlineFastRewind } from "react-icons/md";
import { trackList } from './trackList';


const AudioPlayer = () => {
	const [tracks, setTracks] = useState<Track[]>([]);
	const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0); // State to manage the current track index
	const [isPlaying, setIsPlaying] = useState<boolean>(false); // State to manage the play/pause status
	const [progress, setProgress] = useState<number>(0); // State to manage the progress of the current track
	const [currentTime, setCurrentTime] = useState<number>(0); // State to manage the current time of the track
	const [duration, setDuration] = useState<number>(0); // State to manage the duration of the track
	const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to manage the audio element

	// Image in Full view
	const [opened, { open, close }] = useDisclosure(false);

	useEffect(() => {
		setTracks(trackList);
	}, []);

	// Function to handle play/pause toggle
	const handlePlayPause = () => {
		if (isPlaying) {
			audioRef.current?.pause();
			setIsPlaying(false);
		} else {
			audioRef.current?.play();
			setIsPlaying(true);
		}
	};
	// Effect to play/pause audio when isPlaying changes
	useEffect(() => {
		if (audioRef.current) {
			if (isPlaying)
				audioRef.current.play();
			else
				audioRef.current.pause();
		}
	}, [isPlaying]);


	const handleNextTrack = () => setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
	const handlePrevTrack = () => setCurrentTrackIndex((prevIndex) => prevIndex === 0 ? tracks.length - 1 : prevIndex - 1);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleSeek = (seconds: number) => {
		const audio = audioRef.current;
		if (audio && !isNaN(audio.duration) && audio.duration > 0) {
			let target = audio.currentTime + seconds;
			if (target < 0) target = 0;
			if (target > audio.duration) target = audio.duration;
			// console.log(target);
			audio.currentTime = target;
			console.log('AFTER:', audio.currentTime);
			// Do NOT call setCurrentTime here - onTimeUpdate triggers it
			// setCurrentTime(newTime); // Not needed, will update via onTimeUpdate
			// setProgress((newTime / duration) * 100); // Not needed, will update via onTimeUpdate
		}
	};


	// Function to handle time update of the track
	const handleTimeUpdate = () => {
		if (audioRef.current && audioRef.current.duration) {
			setCurrentTime(audioRef.current.currentTime);
			setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
		}
	};

	// Function to handle metadata load of the track
	// Start playback and reset to 0 when metadata for new track loads
	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
			audioRef.current.currentTime = 0;
			setCurrentTime(0);
			setProgress(0);
			if (isPlaying) {
				audioRef.current.play();
			}
		}
	};




	// Function to format time in minutes and seconds
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	};

	// Only reset audio when the current track or tracks array changes
	useEffect(() => {
		if (audioRef.current && tracks[currentTrackIndex]) {
			audioRef.current.pause();
			audioRef.current.src = tracks[currentTrackIndex].musicFile;
			audioRef.current.load();
		}
	}, [currentTrackIndex, tracks]);

	// NEW: Function to generate the SVG paths dynamically based on progress
	const renderWaveform = () => {
		const circleCount = 16;
		const radius = 90;
		const activeCount = Math.floor((progress / 100) * circleCount);

		return Array.from({ length: circleCount }).map((_, i) => {
			const angle = (i / circleCount) * Math.PI * 2;
			const x = 100 + Math.cos(angle) * radius;
			const y = 100 + Math.sin(angle) * radius;
			const nextAngle = ((i + 1) / circleCount) * Math.PI * 2;
			const nextX = 100 + Math.cos(nextAngle) * radius;
			const nextY = 100 + Math.sin(nextAngle) * radius;

			return (
				<path key={i} className={`wave-circle ${i <= activeCount ? 'active' : ''}`}
					d={`M ${x} ${y} A ${radius} ${radius} 0 0 1 ${nextX} ${nextY}`} />
			);
		});
	};

	if (tracks.length === 0) {
		return (
			<Flex align="center" justify="center" h="100vh">
				<Text c="white">No music...</Text>
			</Flex>
		);
	}




	// Don't render player UI if tracks have not yet loaded
	if (tracks.length === 0) {
		return (
			<Flex align="center" justify="center" h="100vh">
				<Text c="white">No music...</Text>
			</Flex>
		);
	}

	return (
		<>

			{/* The Modal for Full Screen Viewing */}
			<Modal
				opened={opened}
				onClose={close}
				withCloseButton={false}
				centered
				size="auto"
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 15, /* Heavy blur to match the romantic glass theme */
				}}
				styles={{
					content: { backgroundColor: 'transparent', boxShadow: 'none' }
				}}
			>
				{tracks[currentTrackIndex].thumbnail ? (
					<Image
						src={tracks[currentTrackIndex].thumbnail}
						alt="Full Screen Cover"
						radius="xl"
						style={{ maxHeight: '85vh', maxWidth: '90vw', objectFit: 'contain', boxShadow: '0 0 50px rgba(255, 107, 157, 0.5)' }}
					/>
				) : (
					<Center>
						<IoMdMusicalNotes size="15em" color="white" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,157,0.8))' }} />
					</Center>
				)}
			</Modal>
			<Flex direction="column" align="center" justify="center" h="100vh" w="100%">
				<Card className="love-card" p="xl">
					<CardSection>
						<Flex direction="column" align="center" gap="lg" p="lg">

							<div className="heart-animation">
								<svg viewBox="0 0 100 100">
									<defs>
										<linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style={{ stopColor: "#ff6b9d", stopOpacity: 1 }} />
											<stop offset="50%" style={{ stopColor: "#ff1744", stopOpacity: 1 }} />
											<stop offset="100%" style={{ stopColor: "#ff6b9d", stopOpacity: 1 }} />
										</linearGradient>
									</defs>
									<path fill="url(#heartGradient)" d="M50,85 C50,85 15,60 15,40 C15,25 25,15 35,15 C42,15 47,20 50,25 C53,20 58,15 65,15 C75,15 85,25 85,40 C85,60 50,85 50,85 Z" />
								</svg>
							</div>

							<Title order={1} className="love-title" mb="sm">LOVE MESSAGE</Title>

							{/* NEW: Circular Waveform & Center Image */}
							<div className="waveform-container">
								<svg className="circular-waveform" viewBox="0 0 200 200">
									<defs>
										<linearGradient id="waveGradient">
											<stop offset="0%" style={{ stopColor: "#ff6b9d", stopOpacity: 1 }} />
											<stop offset="100%" style={{ stopColor: "#ff1744", stopOpacity: 1 }} />
										</linearGradient>
									</defs>
									<g id="waveCircles">{renderWaveform()}</g>
								</svg>

								{/* The Album Image inside the waveform */}
								<div className="center-image-container">
									<div className="center-image-inner" onClick={open}>
										{tracks[currentTrackIndex].thumbnail ?
											<Image src={tracks[currentTrackIndex].thumbnail} alt="Album Cover" w={150} h={150} fit="cover" /> :
											<Center w={150} h={150} bg="rgba(255,255,255,0.1)">
												<IoMdMusicalNotes size="3em" color="white" />
											</Center>}
									</div>
								</div>
							</div>

							<Stack gap={2} align="center">
								<Title order={2} size="h3" c="white" fw={400}>{tracks[currentTrackIndex]?.title.replace(/-\d+$/, "") || "Audio Title"}</Title>
								<Text c="rgba(255,255,255,0.7)" size="md" fs="italic">From My Heart to Yours</Text>
							</Stack>

							<Stack gap={2} w="100%">
								<Progress value={progress} size="md" />
								<Group justify="space-between" gap="xs">
									<Text size="xs" c="rgba(255,255,255,0.8)">{formatTime(currentTime)}</Text>
									<Text size="xs" c="rgba(255,255,255,0.8)">{formatTime(duration)}</Text>
								</Group>
							</Stack>

							<Group gap="xl" mt="sm">
								<Button className="love-btn love-btn-side" onClick={handlePrevTrack}>
									<MdOutlineFastRewind size={20} />
								</Button>

								<Button className="love-btn love-btn-main" onClick={handlePlayPause}>
									{isPlaying ? <CiPause1 size={28} /> : <CiPlay1 size={28} />}
								</Button>

								<Button className="love-btn love-btn-side" onClick={handleNextTrack}>
									<FaForward size={20} />
								</Button>
							</Group>

							<audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} />
						</Flex>
					</CardSection>
				</Card>
			</Flex>
		</>
	);
};

export default AudioPlayer;