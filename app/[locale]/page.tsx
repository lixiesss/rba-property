import { Approach } from "@/components/home/Approach";
import { BrandStory } from "@/components/home/BrandStory";
import { ContactCTA } from "@/components/home/ContactCTA";
import { FaqPreview } from "@/components/home/FaqPreview";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Hero } from "@/components/home/Hero";
import { Locations } from "@/components/home/Locations";
import { PropertySearch } from "@/components/home/PropertySearch";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getI18n } from "@/lib/i18n/server";
import { localeMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata() {
  const { locale, t } = await getI18n();
  return localeMetadata(locale, "/", "RBA Property", t("Curated villas, land, and investment properties across Bali's most desirable locations."));
}

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <PropertySearch />
        <FeaturedProperties />
        <BrandStory />
        <Locations />
        <Approach />
        <FaqPreview />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
