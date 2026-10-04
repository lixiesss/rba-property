"use client";
import { useI18n } from "@/lib/i18n/client";


import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useState, type CSSProperties } from "react";
import type { PropertyImage } from "@/lib/data/properties";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [dimensions, setDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const reducedMotion = useReducedMotion();
  const go = useCallback((next: number) => setIndex((next + images.length) % images.length), [images.length]);
  if (!images.length) return <div className="property-gallery-empty">{t("Images coming soon")}</div>;
  const active = images[index];
  const size = dimensions[active.id];

  return (
    <div className="property-gallery" role="region" aria-label={`${title} ${t("image gallery")}`} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
    }} tabIndex={0}>
      <div className="property-gallery-viewport relative overflow-hidden" data-portrait={size ? size.height > size.width : undefined} style={size ? { "--media-ratio": size.width / size.height } as CSSProperties : undefined}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={images[index].id}
            className="property-gallery-media"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag={images.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            style={{ touchAction: "pan-y" }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -45 || info.velocity.x < -350) go(index + 1);
              if (info.offset.x > 45 || info.velocity.x > 350) go(index - 1);
            }}
          >
            <Image src={active.src} alt={active.alt} width={size?.width ?? 1250} height={size?.height ?? 1250} className="property-gallery-image select-none" sizes="(min-width: 1360px) 1250px, (min-width: 768px) 92vw, 100vw" loading="eager" draggable={false} onLoad={(event) => {
              const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
              if (width && height) setDimensions((current) => current[active.id]?.width === width && current[active.id]?.height === height ? current : { ...current, [active.id]: { width, height } });
            }} />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 ? <>
          <button className="gallery-button gallery-button-prev" onClick={() => go(index - 1)} type="button" aria-label={t("Previous image")}>&#8592;</button>
          <button className="gallery-button gallery-button-next" onClick={() => go(index + 1)} type="button" aria-label={t("Next image")}>&#8594;</button>
          <p className="gallery-count" aria-live="polite">{index + 1} / {images.length}</p>
        </> : null}
      </div>
      {images[index].caption ? <p className="mt-3 text-sm text-muted">{images[index].caption}</p> : null}
    </div>
  );
}
