import type { Metadata, Viewport } from "next";
import { InitialFonts } from "@/features/shell/InitialFonts";
import { ServiceWorker } from "@/features/shell/ServiceWorker";
import "./fonts-generated.css";
import "./globals.css";
import "./shell.css";
import "./scenes.css";
import "./room.css";
import "./dialogs.css";
import "./progress.css";
import "./coloring.css";
import "./collection.css";
import "./library.css";
import "./decorations.css";

export const metadata: Metadata = {
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: "Dziedzictwo", statusBarStyle: "default" },
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icons/icon-32.png`, apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icons/icon-180.png` },
  title: "Dziedzictwo — Polish Heritage Hearth",
  description:
    "Jeden dom. Cztery epoki. Odkryj polską historię i przywróć jej kolory.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e8e4d8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <head><InitialFonts /></head>
      <body>{children}<ServiceWorker /></body>
    </html>
  );
}
