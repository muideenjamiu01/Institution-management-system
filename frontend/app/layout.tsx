'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { StudentAuthProvider } from "@/lib/student-auth-context";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';

const inter = Inter({ subsets: ["latin"] });

// Metadata needs to be exported from a server component
// export const metadata: Metadata = {
//   title: "Institutional Management System",
//   description: "Complete institutional management system for academic institutions",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Institutional Management System</title>
        <meta name="description" content="Complete institutional management system for academic institutions" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <StudentAuthProvider>
            {children}
            <Toaster />
          </StudentAuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
