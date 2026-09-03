import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "3D ULPIN Cadastral Portal | Ministry of Rural Development",
  description:
    "3D ULPIN Generation and Vertical Property Mapping System — Extending Bhu-Aadhaar to 3D for multi-storey buildings, underground infrastructure, and elevated corridors. SIH 2026 (SIH26011).",
  keywords: "3D ULPIN, Bhu-Aadhaar, cadastre, vertical property mapping, DILRMP, Ministry of Rural Development, SIH 2026, GIS, CityGML, PostGIS, digital twin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
