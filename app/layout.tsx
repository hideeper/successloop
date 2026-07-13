import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { RegisterSW } from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "SuccessLoop",
  description: "나의 진정한 목표를 매일 달성한다.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SuccessLoop",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <RegisterSW />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
