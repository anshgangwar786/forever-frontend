import Hero from "../components/Hero";
import CategoryGrid from "../components/CategoryGrid";
import DealsSection from "../components/DealsSection";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <DealsSection />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      <NewsletterBox />
    </>
  );
}
