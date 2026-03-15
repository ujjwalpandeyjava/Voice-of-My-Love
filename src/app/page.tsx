import { Button } from '@mantine/core';
import Link from 'next/link';
import { FaCloudUploadAlt } from 'react-icons/fa';
import AudioPlayer from './AudioPlayer';



export default function Home() {
  return (
    <div className="home-page" >
      <AudioPlayer />
      <Button leftSection={<FaCloudUploadAlt />} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: "unset" }} variant="default">
        <Link href="/upload" style={{ fontWeight: 600 }}>Upload More</Link>
      </Button>
    </div>
  );
}
