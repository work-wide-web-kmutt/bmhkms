import { useId, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useFilterContext } from "./filter-context";
import { buildFilterLabel, scrollOptionIntoView } from "./filter-utils";
import type { FilterFieldConfig } from "./types";

interface SelectOptionsPopoverProps<T = unknown> {
  field: FilterFieldConfig<T>;
  values: T[];
  onChange: (values: T[]) => void;
  onClose?: () => void;
  inline?: boolean;
}

export function SelectOptionsPopover<T = unknown>({
  field,
  values,
  onChange,
  onClose,
  inline = false,
}: SelectOptionsPopoverProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useFilterContext();
  const baseId = useId();

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchInput, open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && open) {
      scrollOptionIntoView(baseId, highlightedIndex);
    }
  }, [highlightedIndex, open, baseId]);

  const isMultiSelect = field.type === "multiselect" || values.length > 1;
  const effectiveValues =
    field.value === undefined ? values : (field.value as T[]);
  const selectedOptions =
    field.options?.filter((opt) => effectiveValues.includes(opt.value)) || [];
  const unselectedOptions =
    field.options?.filter((opt) => !effectiveValues.includes(opt.value)) || [];
  const filteredSelectedOptions = selectedOptions;
  const filteredUnselectedOptions = unselectedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchInput.toLowerCase())
  );
  const allFilteredOptions = [
    ...filteredSelectedOptions,
    ...filteredUnselectedOptions,
  ];

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  function renderMenuContent() {
    return (
      <>
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
              tabIndex={0}
              placeholder={context.i18n.placeholders.searchField(
                field.label || ""
              )}
              className={cn(
                "border-input h-8 rounded-none border-0 bg-transparent! px-2 text-sm shadow-none",
                "focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0",
                open && "placeholder:text-foreground"
              )}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={() => open && inputRef.current?.focus()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (allFilteredOptions.length > 0) {
                    setHighlightedIndex((prev) =>
                      prev < allFilteredOptions.length - 1 ? prev + 1 : 0
                    );
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (allFilteredOptions.length > 0) {
                    setHighlightedIndex((prev) =>
                      prev > 0 ? prev - 1 : allFilteredOptions.length - 1
                    );
                  }
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  setOpen(false);
                } else if (e.key === "Enter" && highlightedIndex >= 0) {
                  e.preventDefault();
                  const option = allFilteredOptions[highlightedIndex];
                  if (option) {
                    const isSelected = effectiveValues.includes(
                      option.value as T
                    );
                    let next: T[];

                    if (isSelected) {
                      next = effectiveValues.filter(
                        (v) => v !== option.value
                      ) as T[];
                    } else if (isMultiSelect) {
                      next = [...effectiveValues, option.value] as T[];
                    } else {
                      next = [option.value] as T[];
                    }

                    if (
                      !isSelected &&
                      isMultiSelect &&
                      field.maxSelections &&
                      next.length > field.maxSelections
                    ) {
                      return;
                    }

                    if (field.onValueChange) {
                      field.onValueChange(next);
                    } else {
                      onChange(next);
                    }

                    if (!isMultiSelect) {
                      handleClose();
                    }
                  }
                }

                e.stopPropagation();
              }}
            />
            <DropdownMenuSeparator />
          </>
        )}
        <div className="relative flex max-h-full">
          <div
            className="flex max-h-[min(var(--available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain"
            id={`${baseId}-listbox`}
            tabIndex={-1}
          >
            <ScrollArea className="size-full min-h-0 **:data-[slot=scroll-area-scrollbar]:m-0 **:data-[slot=scroll-area-viewport]:h-full **:data-[slot=scroll-area-viewport]:overscroll-contain">
              {allFilteredOptions.length === 0 && (
                <div className="text-muted-foreground py-2 text-center text-sm">
                  {context.i18n.noResultsFound}
                </div>
              )}
              {filteredSelectedOptions.length > 0 && (
                <DropdownMenuGroup className="px-1">
                  {filteredSelectedOptions.map((option, index) => {
                    const isHighlighted = highlightedIndex === index;
                    const itemId = `${baseId}-item-${index}`;

                    return (
                      <DropdownMenuCheckboxItem
                        key={String(option.value)}
                        id={itemId}
                        tabIndex={-1}
                        data-highlighted={isHighlighted || undefined}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        checked={true}
                        className={cn(
                          "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                          option.className
                        )}
                        onSelect={(e) => {
                          if (isMultiSelect) {
                            e.preventDefault();
                          }
                        }}
                        onCheckedChange={() => {
                          const next = effectiveValues.filter(
                            (v) => v !== option.value
                          ) as T[];

                          if (field.onValueChange) {
                            field.onValueChange(next);
                          } else {
                            onChange(next);
                          }

                          if (!isMultiSelect) {
                            handleClose();
                          }
                        }}
                      >
                        {option.icon}
                        <span className="truncate">{option.label}</span>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuGroup>
              )}
              {filteredSelectedOptions.length > 0 &&
                filteredUnselectedOptions.length > 0 && (
                  <DropdownMenuSeparator className="mx-0" />
                )}
              {filteredUnselectedOptions.length > 0 && (
                <DropdownMenuGroup className="px-1">
                  {filteredUnselectedOptions.map((option, index) => {
                    const overallIndex = index + filteredSelectedOptions.length;
                    const isHighlighted = highlightedIndex === overallIndex;
                    const itemId = `${baseId}-item-${overallIndex}`;

                    return (
                      <DropdownMenuCheckboxItem
                        key={String(option.value)}
                        id={itemId}
                        tabIndex={-1}
                        data-highlighted={isHighlighted || undefined}
                        onMouseEnter={() => setHighlightedIndex(overallIndex)}
                        checked={false}
                        className={cn(
                          "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                          option.className
                        )}
                        onSelect={(e) => {
                          if (isMultiSelect) {
                            e.preventDefault();
                          }
                        }}
                        onCheckedChange={() => {
                          const next = isMultiSelect
                            ? ([...effectiveValues, option.value] as T[])
                            : ([option.value] as T[]);

                          if (
                            isMultiSelect &&
                            field.maxSelections &&
                            next.length > field.maxSelections
                          ) {
                            return;
                          }

                          if (field.onValueChange) {
                            field.onValueChange(next);
                          } else {
                            onChange(next);
                          }

                          if (!isMultiSelect) {
                            handleClose();
                          }
                        }}
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
      </>
    );
  }

  if (inline) {
    return <div className="w-full">{renderMenuContent()}</div>;
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          return;
        }

        setTimeout(() => setSearchInput(""), 200);
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size={context.size}>
            <div className="flex items-center gap-1.5">
              {field.customValueRenderer ? (
                field.customValueRenderer(values, field.options || [])
              ) : (
                <>
                  {selectedOptions.length > 0 && (
                    <div className="flex items-center -space-x-1.5">
                      {selectedOptions.slice(0, 3).map((option) => (
                        <div key={String(option.value)}>{option.icon}</div>
                      ))}
                    </div>
                  )}
                  {selectedOptions.length === 1
                    ? selectedOptions[0]?.label
                    : buildFilterLabel(selectedOptions.length, context.i18n)}
                </>
              )}
            </div>
          </Button>
        }
      />
      <DropdownMenuContent
        align="start"
        className={cn("w-50 px-0", field.className)}
      >
        {renderMenuContent()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
