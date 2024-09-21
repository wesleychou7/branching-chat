"use client";
import { Inter } from "next/font/google";
import { store } from "@/app/store";
import { Provider } from "react-redux";
import { APIContextProvider } from "@/app/context/APIContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <APIContextProvider>
      <Provider store={store}>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </Provider>
    </APIContextProvider>
  );
}
