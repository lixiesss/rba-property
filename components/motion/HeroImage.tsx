"use client";
import { useI18n } from "@/lib/i18n/client";


import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export function HeroImage() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  return <motion.div className="absolute inset-0" initial={{ opacity: 0.88, scale: reducedMotion ? 1 : 1.025 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reducedMotion ? 0.2 : 1.1, ease: [0.22, 1, 0.36, 1] }}><Image src="/images/hero-uluwatu.png" alt={t("Contemporary cliffside villa and infinity pool overlooking the ocean in Uluwatu")} fill priority className="object-cover object-[64%_center]" sizes="100vw" /></motion.div>;
}
