import { Button } from '@mantine/core';
import Link from 'next/link';
import { FaCloudUploadAlt } from 'react-icons/fa';
import AudioPlayer from './AudioPlayer';



export default function Home() {
  return (
    <div className="home-page" >
      <AudioPlayer />
      <Link href="/upload" className="uploadBtn">
        <FaCloudUploadAlt size={20} />
        <span>Upload More</span>
      </Link>
    </div>
  );
}
