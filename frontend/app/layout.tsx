import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { StudentAuthProvider } from "@/lib/student-auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Institutional Management System",
  description: "Complete institutional management system for academic institutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StudentAuthProvider>
          {children}
          <Toaster />
        </StudentAuthProvider>
      </body>
    </html>
  );
}
