import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { ScrollToTop } from "./components/ScrollToTop";
import { Features } from "./components/Features"
import { Toaster } from "@/components/ui/toaster"

import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
      <ScrollToTop />
      <Toaster />
    </>
  );
}

export default App;
