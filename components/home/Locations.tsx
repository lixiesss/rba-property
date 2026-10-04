
import { getI18n } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "next/link";
import { locations } from "@/lib/content";

export async function Locations() {
  const { t, href } = await getI18n();
  return (
    <section id="locations" className="home-locations section-space scroll-mt-20" aria-labelledby="locations-title">
      <div className="page-shell">
        <h2 id="locations-title" className="home-section-title display-serif max-w-3xl text-[clamp(2.7rem,5vw,4rem)] leading-[1.02] text-espresso">{t("Different parts of Bali offer different ways to live.")}</h2>
        <div className="home-locations__grid mt-12 grid auto-rows-[230px] gap-4 md:grid-cols-12 md:auto-rows-[240px]">
          {locations.map((location) => (
            <Link href={href(`/properties?location=${location.name.toLowerCase()}`)} key={location.name} className={`image-link group relative overflow-hidden rounded-[14px] bg-sandstone ${location.className}`}>
              <Image src={location.image} alt={`${location.name}, Bali`} fill className="image-zoom object-cover" sizes="(max-width: 768px) 100vw, 60vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
                <div><h3 className="display-serif text-3xl">{location.name}</h3><p className="mt-1 text-sm text-white/78">{t(location.count)}</p></div>
                <span aria-hidden="true" className="text-2xl transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
