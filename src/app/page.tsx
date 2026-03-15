import { Text, Button } from '@mantine/core';
import Link from 'next/link';
import { FaCloudUploadAlt } from 'react-icons/fa';
import AudioPlayer from './AudioPlayer';



export default function Home() {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="home-page" >
      <AudioPlayer />
      <Text className="byUjjwal"><b>Created by:</b> Ujjwal Pandey</Text>
      {isDev && <Link href="/upload" className="uploadBtn">
        <FaCloudUploadAlt size={20} />
        <span>Upload More</span>
      </Link>}
    </div>
  );
}
