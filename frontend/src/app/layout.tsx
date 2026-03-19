import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Online Exam Portal",
  description: "Secure and easy online examination system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
