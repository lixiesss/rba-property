
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";

export async function Footer() {
  const { t, href } = await getI18n();
  const settings = await getSiteSettings();
  return (
    <footer className="bg-espresso text-ivory">
      <div className="page-shell grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href={href("/")} className="font-semibold tracking-[0.12em]">RBA PROPERTY</Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-ivory/65">{t("Contemporary tropical property, grounded in Bali.")}</p>
        </div>
        <FooterGroup title={t("Explore")} links={[['Properties', '/properties'], ['Land', '/properties?type=land'], ['Villas', '/properties?type=villa'], ['Locations', '/#locations']]} />
        <FooterGroup title={t("Company")} links={[['About', '/#about'], ['FAQ', '/#faq'], ['Contact', '/#contact']]} />
        <div>
          <h2 className="text-sm font-semibold">{t("Contact")}</h2>
          <div className="mt-4 grid gap-2 text-sm leading-7 text-ivory/65">
            {settings.companyEmail ? <Link href={`mailto:${settings.companyEmail}`}>{settings.companyEmail}</Link> : null}
            {settings.phone ? <Link href={`tel:${settings.phone}`}>{settings.phone}</Link> : null}
            {settings.whatsapp ? <Link href={settings.whatsapp}>WhatsApp</Link> : null}
            {settings.officeAddress ? <p>{settings.officeAddress}</p> : null}
            {!settings.companyEmail && !settings.phone && !settings.whatsapp && !settings.officeAddress ? <p>{t("Contact details to be confirmed by RBA.")}</p> : null}
          </div>
        </div>
      </div>
      <div className="page-shell flex flex-col gap-3 border-t border-white/15 py-6 text-xs text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} RBA Property</p>
        <p>{t("Privacy and terms content required")}</p>
      </div>
    </footer>
  );
}

async function FooterGroup({ title, links }: { title: string; links: [string, string][] }) {
  const { t, href: localized } = await getI18n();
  return (
    <div>
      <h2 className="text-sm font-semibold">{t(title)}</h2>
      <ul className="mt-4 grid gap-2 text-sm text-ivory/65">
        {links.map(([label, href]) => <li key={label}><Link href={localized(href)} className="inline-flex min-h-8 items-center hover:text-ivory">{t(label)}</Link></li>)}
      </ul>
    </div>
  );
}
