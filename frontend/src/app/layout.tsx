import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CssBaseline } from "@mui/material";

export const metadata: Metadata = {
  title: "Gestor de Tareas",
  description: "Aplicación de gestión de tareas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={'antialiased'}
      >
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
