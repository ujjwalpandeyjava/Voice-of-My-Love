"use client";

import { Paper, Container, Title, Group, Button } from '@mantine/core';
import { TiArrowBackOutline } from "react-icons/ti";
import Link from "next/link";

``

export default function UloadLayout({ children }: { children: React.ReactNode }) {
	return (
		<Container size="sm" py="xl">
			<Group justify="flex-start" mb="xl">
				<Button leftSection={<TiArrowBackOutline />} component={Link} href="/" variant="outline">Back to Player</Button>
			</Group>

			<Paper shadow="md" p="lg" withBorder>
				<Title order={2} mb="md">Upload Files</Title>
				{children}
			</Paper>
		</Container>
	);
}
