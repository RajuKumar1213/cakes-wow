import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import ImagePreloader from "@/components/ImagePreloader";

// Optimized font loading - only load weights we actually use
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // Better performance
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap", // Better performance
  preload: true,
});

export const metadata: Metadata = {
  title: "Cakeswow - Premium Cakes & Desserts",
  description: "Order fresh, delicious cakes and desserts online. Best quality ingredients, beautiful designs, doorstep delivery.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' }
    ],
    apple: '/favicon.svg',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">      <head>
        {/* Next.js Google Fonts handles font optimization automatically */}
        <meta name="theme-color" content="#DC2626" />
        {/* Razorpay Checkout Script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body
        className={`${poppins.variable} ${inter.variable} font-inter antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <CategoriesProvider>
              <ToastProvider>
                <ImagePreloader />
                {children}
              </ToastProvider>
            </CategoriesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
