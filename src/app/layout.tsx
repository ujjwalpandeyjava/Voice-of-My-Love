import "@/style/globals.css";
import { MantineProvider, mantineHtmlProps } from '@mantine/core';
import '@mantine/core/styles.css';
import type { Metadata, Viewport } from "next";



export const metadata: Metadata = {
  title: "Voice of My Love 💝",
};

export const viewport: Viewport = {
  themeColor: '#8b0a50',
};


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <body>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}