import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Script from "next/script";
import ShopContextProvider from "../context/ShopContext";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Vellora — Modern Multi-Category E-Commerce Marketplace",
  description: "Shop premium Electronics, Fashion & Apparel, Home & Kitchen, Beauty, and Sports with express delivery and secure checkout at Vellora.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-ink selection:text-canvas font-sans antialiased">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <ShopContextProvider>
          <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] flex-1 flex flex-col">
            <ToastContainer
              position="top-right"
              autoClose={2500}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              theme="light"
            />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ShopContextProvider>
      </body>
    </html>
  );
}
