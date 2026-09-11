import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intentional Self - Demo",
  description: "Intentional Self Counseling Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
