"use client";

import { create } from "zustand";

/** Which project card / skill group the visitor is hovering or focusing; scenes react to it. */
interface FocusState {
  project: string | null;
  skillGroup: string | null;
  setProject: (slug: string | null) => void;
  setSkillGroup: (id: string | null) => void;
}

export const useFocusStore = create<FocusState>()((set) => ({
  project: null,
  skillGroup: null,
  setProject: (project) => set({ project }),
  setSkillGroup: (skillGroup) => set({ skillGroup }),
}));
