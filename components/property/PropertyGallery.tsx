"use client";
import { useI18n } from "@/lib/i18n/client";


import Image, { getImageProps } from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useReducer, useRef, type CSSProperties } from "react";
import { galleryReducer, initialGalleryState, adjacentIndices } from "./gallery-state";
import type { PropertyImage } from "@/lib/data/properties";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const { t } = useI18n();
  if (!images.length) return <div className="property-gallery-empty">{t("Images coming soon")}</div>;
  return <LoadedGallery key={images.map(image => image.src).join("|")} images={images} title={title} />;
}

const sizes = "(min-width: 1360px) 1250px, (min-width: 768px) calc(100vw - 160px), calc(100vw - 40px)";

function LoadedGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const { t } = useI18n();
  const [state, dispatch] = useReducer(galleryReducer, initialGalleryState);
  const pending = useRef(new Map<number, HTMLImageElement>());
  const reducedMotion = useReducedMotion();
  const go = (delta: number) => dispatch({ type: "navigate", delta, count: images.length });
  const index = state.displayed;
  const active = images[index];
  const size = state.loaded[index];
  useEffect(() => {
    let cancelled = false;
    const indices = new Set([state.target, ...adjacentIndices(state.displayed, images.length)]);
    for (const i of indices) {
      // The initial rendered Next Image owns its request; neighbours use identical optimized candidates.
      if (state.loaded[i] || pending.current.has(i) || (i === 0 && !state.loaded[0])) continue;
      const image = new window.Image();
      pending.current.set(i, image);
      const { props } = getImageProps({ src: images[i].src, alt: "", width: 1250, height: 1250, sizes });
      image.onload = async () => {
        try {
          await image.decode();
          if (!cancelled) dispatch({ type: "loaded", index: i, width: image.naturalWidth, height: image.naturalHeight });
        } catch {
          if (!cancelled) dispatch({ type: "failed", index: i });
        }
      };
      image.onerror = () => { if (!cancelled) dispatch({ type: "failed", index: i }); };
      image.sizes = props.sizes ?? sizes;
      image.srcset = props.srcSet ?? "";
      image.src = props.src;
    }
    const requests = pending.current;
    return () => {
      cancelled = true;
      for (const image of requests.values()) { image.onload = null; image.onerror = null; }
      requests.clear();
    };
  }, [images, state.target, state.displayed, state.loaded]);

  return (
    <div className="property-gallery" role="region" aria-label={`${title} ${t("image gallery")}`} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    }} tabIndex={0}>
      <div className="property-gallery-viewport relative overflow-hidden" data-portrait={size ? size.height > size.width : undefined} style={size ? { "--media-ratio": size.width / size.height } as CSSProperties : undefined}>
        {!size ? <div className="property-gallery-skeleton" aria-busy={!state.failed} >{state.failed ? t("Images coming soon") : null}</div> : null}
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={images[index].id}
            className="property-gallery-media"
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            drag={images.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            style={{ touchAction: "pan-y" }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -45 || info.velocity.x < -350) go(1);
              if (info.offset.x > 45 || info.velocity.x > 350) go(-1);
            }}
          >
            <Image src={active.src} alt={active.alt} width={1250} height={1250} style={size ? { aspectRatio: `${size.width} / ${size.height}` } : { position: "absolute", opacity: 0 }} className="property-gallery-image select-none" sizes={sizes} fetchPriority={index === 0 ? "high" : "auto"} loading="eager" draggable={false} onError={() => dispatch({ type: "failed", index })} onLoad={(event) => {
              const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
              if (width && height) dispatch({ type: "loaded", index, width, height });
            }} />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 ? <>
          <button className="gallery-button gallery-button-prev" onClick={() => go(-1)} type="button" aria-label={t("Previous image")}>&#8592;</button>
          <button className="gallery-button gallery-button-next" onClick={() => go(1)} type="button" aria-label={t("Next image")}>&#8594;</button>
          <p className="gallery-count" aria-live="polite">{index + 1} / {images.length}</p>
        </> : null}
      </div>
      {images[index].caption ? <p className="mt-3 text-sm text-muted">{images[index].caption}</p> : null}
    </div>
  );
}
