
import FeaturedSection from "../Pages/Featuredsection";
import TrendingCategoriesPage from "../Pages/TrendingPage";
import MainBanner from "./Banner";
import CategoryStrip from "./CategoryStrip";
import HomeHeroCarousel from "./HomeHeroSection";
import HomeProductShowcase from "./HomeProductShowcase";
import HowItWorks from "./HowItWorks";
import TrustBar from "./TrustBar";
export default function Home({ gender }) {
  return (
    <>
      <CategoryStrip />
      <MainBanner/>
      <TrustBar />
      <HomeHeroCarousel/>
      <HowItWorks />
      <HomeProductShowcase selectedGender={gender} />
      <TrendingCategoriesPage />
      <FeaturedSection/>
    </>
  );
}
