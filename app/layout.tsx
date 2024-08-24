import type { Metadata } from "next";
import { ConvexClientProvider } from "./ConvexClientProvider";

import "./globals.css";
import { APP_DESCRIPTION, APP_NAME } from "@/constants/common";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@200,300,400,500,700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicons/safari-pinned-tab.svg"
          color="#000000"
        />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, target-densitydpi=device-dpi"
        />
      </head>
      <body>
        <ConvexClientProvider>
          <div className="m-auto xl:max-w-[1440px] 2xl:max-w-[1920px]">
            <Toaster
              theme="light"
              richColors={true}
              expand={true}
              closeButton={true}
              toastOptions={{
                style: {
                  fontFamily: `"Cabinet Grotesk", sans-serif`,
                },
              }}
            />
            {children}
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
