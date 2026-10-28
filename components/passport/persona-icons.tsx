import type { ReactNode } from "react";
import { Flame, Gift, Hourglass, RotateCcw, Terminal, Zap } from "lucide-react";
import type { Persona } from "@/lib/passport-story";

/** One lucide glyph per passport persona; shared by the story slides, the card and the full passport. */
export const PERSONA_ICON: Record<Persona["key"], ReactNode> = {
  phoenix: <Flame />,
  sprinter: <Zap />,
  veteran: <Hourglass />,
  free_spirit: <Terminal />,
  gift: <Gift />,
  comeback: <RotateCcw />,
};
