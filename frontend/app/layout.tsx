import { Inter } from "next/font/google";
import Providers from "./providers";

import "@/styles/globals.css";
import "@/styles/images.css";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
          <Providers>{children}</Providers>
      </body>
    </html>
  );
}
