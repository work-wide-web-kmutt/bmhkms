import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { scrollOptionIntoView } from "./filter-utils";
import type { FilterFieldConfig, FilterI18nConfig } from "./types";

interface FilterSubmenuContentProps<T = unknown> {
  field: FilterFieldConfig<T>;
  currentValues: T[];
  isMultiSelect: boolean;
  onToggle: (value: T, isSelected: boolean) => void;
  i18n: FilterI18nConfig;
  isActive?: boolean;
  onActive?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export function FilterSubmenuContent<T = unknown>({
  field,
  currentValues,
  isMultiSelect,
  onToggle,
  i18n,
  isActive,
  onActive,
  onBack,
  onClose,
}: FilterSubmenuContentProps<T>) {
  const [searchInput, setSearchInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();

  useEffect(() => {
    if (isActive && field.searchable !== false) {
      inputRef.current?.focus();
    }
  }, [isActive, field.searchable, baseId]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchInput]);

  useEffect(() => {
    if (highlightedIndex >= 0 && isActive) {
      scrollOptionIntoView(baseId, highlightedIndex);
    }
  }, [highlightedIndex, isActive, baseId]);

  const filteredOptions = useMemo(
    () =>
      field.options?.filter((option) => {
        const isSelected = currentValues.includes(option.value);
        if (isSelected || !searchInput) {
          return true;
        }
        return option.label.toLowerCase().includes(searchInput.toLowerCase());
      }) || [],
    [field.options, searchInput, currentValues]
  );

  useEffect(() => {
    if (isActive && filteredOptions.length > 0) {
      setHighlightedIndex(0);
    }
  }, [isActive, filteredOptions.length]);

  return (
    <div className="flex flex-col" onMouseEnter={onActive}>
      {field.searchable !== false && (
        <>
          <Input
            ref={inputRef}
            aria-expanded="true"
            aria-haspopup="listbox"
            aria-controls={`${baseId}-listbox`}
            aria-activedescendant={
              highlightedIndex >= 0
                ? `${baseId}-item-${highlightedIndex}`
                : undefined
            }
            placeholder={i18n.placeholders.searchField(field.label || "")}
            className={cn(
              "h-8 rounded-none border-0 bg-transparent! px-2 text-sm shadow-none",
              "focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0",
              isActive && "placeholder:text-foreground"
            )}
            value={searchInput}
            tabIndex={0}
            onBlur={() => isActive && inputRef.current?.focus()}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => onActive?.()}
            onMouseEnter={(e) => {
              onActive?.();
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (filteredOptions.length > 0) {
                  setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                  );
                }
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (filteredOptions.length > 0) {
                  setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                  );
                }
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                onBack?.();
              } else if (e.key === "Enter" && highlightedIndex >= 0) {
                e.preventDefault();
                const option = filteredOptions[highlightedIndex];
                if (option) {
                  onToggle(
                    option.value as T,
                    currentValues.includes(option.value)
                  );
                  if (!isMultiSelect) {
                    onBack?.();
                  }
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                onClose?.();
              }

              e.stopPropagation();
            }}
          />
          <DropdownMenuSeparator />
        </>
      )}
      <div className="relative flex max-h-full">
        <div
          className="flex max-h-[min(var(--available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain outline-hidden"
          id={`${baseId}-listbox`}
        >
          <ScrollArea className="size-full min-h-0 **:data-[slot=scroll-area-scrollbar]:m-0 **:data-[slot=scroll-area-viewport]:h-full **:data-[slot=scroll-area-viewport]:overscroll-contain">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground py-2 text-center text-sm">
                {i18n.noResultsFound}
              </div>
            ) : (
              <DropdownMenuGroup>
                {filteredOptions.map((option, index) => {
                  const isSelected = currentValues.includes(option.value);
                  const isHighlighted = highlightedIndex === index;
                  const itemId = `${baseId}-item-${index}`;

                  return (
                    <DropdownMenuCheckboxItem
                      key={String(option.value)}
                      id={itemId}
                      tabIndex={-1}
                      data-highlighted={isHighlighted || undefined}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      checked={isSelected}
                      className={cn(
                        "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                        option.className
                      )}
                      onSelect={(e) => {
                        if (isMultiSelect) {
                          e.preventDefault();
                        }
                      }}
                      onCheckedChange={() =>
                        onToggle(option.value as T, isSelected)
                      }
                    >
                      {option.icon}
                      <span className="truncate">{option.label}</span>
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuGroup>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
