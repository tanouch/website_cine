import clsx from "clsx";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { ReactNode, StrictMode } from "react";

import Footer from "@/components/layout/footer";
import Newsletter from "@/components/layout/newsletter";
import TopBar from "@/components/layout/top-bar";
import MenuWrapper from "@/components/menu/menu-wrapper";
import {
  SeanceDialog,
  SeanceDialogStoreProvider,
} from "@/components/seance-dialog/seance-dialog";

import "./globals.css";

const degular = localFont({
  src: "../assets/DegularDisplay-Black.woff2",
  weight: "900",
  variable: "--font-degular",
  style: "normal",
});

const suisse = localFont({
  src: [
    {
      path: "../assets/SuisseIntl-Regular-WebS.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/SuisseIntl-RegularItalic-WebS.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/SuisseIntl-Book-WebS.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/SuisseIntl-BookItalic-WebS.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../assets/SuisseIntl-Medium-WebS.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/SuisseIntl-MediumItalic-WebS.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../assets/SuisseIntl-Bold-WebS.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/SuisseIntl-BoldItalic-WebS.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../assets/SuisseIntl-Bold-WebS.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../assets/SuisseIntl-BoldItalic-WebS.woff2",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-suisse",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Le Rétro Projecteur – Ressorties cinéma à Paris",
    default: "Le Rétro Projecteur – Ressorties cinéma à Paris",
  },
  description:
    "Coup de projecteur sur les ressorties cinéma dans les salles parisiennes.",
  metadataBase: new URL("https://leretroprojecteur.com/"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <html lang="fr" className="h-screen overflow-y-auto">
        <head>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=G-F5QY5F8S5L`}
            strategy="afterInteractive"
          />
          <Script id="ga4-analytics">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-F5QY5F8S5L');
            `}
          </Script>
        </head>
        <body
          className={clsx(
            degular.variable,
            suisse.variable,
            "font-suisse text-retro-black",
          )}
        >
          <SeanceDialogStoreProvider>
            <SeanceDialog />
            <MenuWrapper>
              <Newsletter />
              <div className="flex grow flex-col pt-20px lg:pt-0">
                <div className="flex pb-20px lg:hidden">
                  <TopBar />
                </div>
                <div className="flex grow flex-col justify-between">
                  <div className="flex grow flex-col">{children}</div>
                  <div className="flex pt-20px lg:pb-20px lg:pl-20px lg:pt-30px">
                    <Footer />
                  </div>
                </div>
              </div>
            </MenuWrapper>
          </SeanceDialogStoreProvider>
        </body>
      </html>
    </StrictMode>
  );
}
