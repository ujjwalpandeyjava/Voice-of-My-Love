"use client";

import { Paper, Container, Title, Group, Button } from '@mantine/core';
import { TiArrowBackOutline } from "react-icons/ti";
import Link from "next/link";



export default function UploadLayout({ children }: { children: React.ReactNode }) {
	return (
		<Container size="sm" py="xl">
			<Button mb="lg" className="backBtn" leftSection={<TiArrowBackOutline />} component={Link} href="/" variant="outline">Back to Player</Button>
			<Paper shadow="md" p="lg" withBorder>
				<Title order={2} mb="md">Upload Files</Title>
				{children}
			</Paper>
		</Container>
	);
}
