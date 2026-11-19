import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Features } from "@/components/Features";
import { LiveRoutes } from "@/components/LiveRoutes";
import { HowItWorks } from "@/components/HowItWorks";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-black text-white selection:bg-white selection:text-black">
      <Navbar />
      <main className="w-full max-w-full overflow-x-hidden">
        <Hero />
        <Problem />
        <Features />
        <LiveRoutes />
        <HowItWorks />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}
