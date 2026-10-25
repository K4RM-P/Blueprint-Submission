"use client";

import { createContext, useContext } from "react";

export interface StoryMotion {
  /** prefers-reduced-motion (or the styleguide override): crossfades, final values, no 3D. */
  reduced: boolean;
  /** Weak device or small screen: no blur layers or goo. */
  lowPower: boolean;
}

export const StoryMotionContext = createContext<StoryMotion>({ reduced: false, lowPower: false });

export function useStoryMotion(): StoryMotion {
  return useContext(StoryMotionContext);
}
