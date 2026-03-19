import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Online Exam Portal",
  description: "Secure and easy online examination system",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
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
