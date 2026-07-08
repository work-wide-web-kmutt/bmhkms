import { cva } from "class-variance-authority";
import type React from "react";
import { createContext, useContext } from "react";

import { DEFAULT_I18N } from "./i18n";
import type { FilterI18nConfig } from "./types";

export interface FilterContextValue {
  variant: "solid" | "default";
  size: "sm" | "default" | "lg";
  radius: "default" | "full";
  i18n: FilterI18nConfig;
  className?: string;
  showSearchInput?: boolean;
  trigger?: React.ReactNode;
  allowMultiple?: boolean;
}

const FilterContext = createContext<FilterContextValue>({
  allowMultiple: true,
  className: undefined,
  i18n: DEFAULT_I18N,
  radius: "default",
  showSearchInput: true,
  size: "default",
  trigger: undefined,
  variant: "default",
});

export function useFilterContext() {
  return useContext(FilterContext);
}

export const filtersContainerVariants = cva("flex flex-wrap items-center", {
  defaultVariants: {
    size: "default",
    variant: "default",
  },
  variants: {
    size: {
      default: "gap-2.5",
      lg: "gap-3.5",
      sm: "gap-1.5",
    },
    variant: {
      default: "",
      solid: "gap-2",
    },
  },
});

export function FilterProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FilterContextValue;
}) {
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}
