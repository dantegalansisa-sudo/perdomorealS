import { useTranslations } from "next-intl";
import {
  Baby,
  Building,
  Car,
  Dumbbell,
  Eye,
  Flag,
  Flame,
  Laptop,
  type LucideIcon,
  ShieldCheck,
  Sofa,
  Sparkles,
  Sun,
  TreePalm,
  Trees,
  Umbrella,
  WavesLadder,
  Lock,
} from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import type { AmenityKey } from "@/lib/types";

export const AMENITY_ICONS: Record<AmenityKey, LucideIcon> = {
  pool: WavesLadder,
  sea_view: Eye,
  gated: Lock,
  furnished: Sofa,
  gym: Dumbbell,
  clubhouse: Building,
  beach_access: Umbrella,
  golf: Flag,
  security: ShieldCheck,
  playground: Baby,
  bbq: Flame,
  parking: Car,
  garden: Trees,
  rooftop: Sun,
  spa: Sparkles,
  coworking: Laptop,
};

/** Icon grid of project amenities (labels from common.amenities.*). */
export function AmenitiesGrid({ amenities }: { amenities: AmenityKey[] }) {
  const t = useTranslations("common");
  return (
    <Stagger as="ul" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {amenities.map((a) => {
        const Icon = AMENITY_ICONS[a] ?? TreePalm;
        return (
          <StaggerItem as="li" key={a} className="group flex flex-col items-start gap-4 rounded-3xl border border-line bg-white p-5 transition-colors hover:border-gold">
            <span className="grid size-12 place-items-center rounded-2xl bg-sand-2 text-gold-dark transition-colors duration-500 group-hover:bg-navy group-hover:text-gold">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="text-sm leading-snug font-bold text-navy">{t(`amenities.${a}`)}</span>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
