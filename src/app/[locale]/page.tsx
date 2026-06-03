import { getAllRates } from "@/lib/ratesData";
import Ticker from "@/components/layout/Ticker";
import HeroSection from "@/components/sections/HeroSection";
import IntroSection from "@/components/sections/IntroSection";
import RatesSection from "@/components/sections/RatesSection";
import DashboardSection from "@/components/sections/DashboardSection";
import ConverterSection from "@/components/sections/ConverterSection";
import BlackMarketSection from "@/components/sections/BlackMarketSection";
import NewsSection from "@/components/sections/NewsSection";
import CTASection from "@/components/sections/CTASection";

export const revalidate = 3600;

export default async function HomePage() {
  const { date, rates } = await getAllRates();

  return (
    <>
      <Ticker rates={rates} />
      {/* extra top padding to clear the ticker bar */}
      <div className="pt-8">
        <HeroSection rates={rates} date={date} />
        <IntroSection />
        <RatesSection rates={rates} />
        <DashboardSection rates={rates} />
        <ConverterSection rates={rates} />
        <BlackMarketSection rates={rates} />
        <NewsSection />
        <CTASection />
      </div>
    </>
  );
}
