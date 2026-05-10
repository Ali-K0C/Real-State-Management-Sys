import type { Metadata } from "next";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider, ToastContainer } from "@/context/ToastContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Estate Management System",
  description: "Buy and sell properties with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
