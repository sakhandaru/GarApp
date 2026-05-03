import type { Metadata } from "next";
import { AppProvider } from "./_context/AppContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garapp",
  description: "Task manager untuk pribadi produktif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
