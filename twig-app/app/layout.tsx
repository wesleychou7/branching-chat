"use client";
import { Inter } from "next/font/google";
import { store } from "@/app/store";
import { Provider } from "react-redux";
import "./styles.css";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <Provider store={store}>
      <html lang="en">
        <body className={inter.className}>{children}<Analytics /></body>
      </html>
    </Provider>
  );
}
