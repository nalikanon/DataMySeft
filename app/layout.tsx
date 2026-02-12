import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Video Notes",
  description: "บันทึกลิงก์คลิปที่สนใจเก็บไว้ดูทีหลัง",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}


