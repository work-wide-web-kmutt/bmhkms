import { useRender } from "@base-ui/react/use-render";
import type React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { FilterSubmenuContent } from "./filter-submenu-content";
import {
  createFilter,
  flattenFields,
  scrollOptionIntoView,
} from "./filter-utils";
import type { Filter, FilterFieldsConfig, FilterI18nConfig } from "./types";

interface AddFilterMenuProps<T = unknown> {
  filters: Filter<T>[];
  fields: FilterFieldsConfig<T>;
  onChange: (filters: Filter<T>[]) => void;
  trigger?: React.ReactNode;
  showSearchInput?: boolean;
  allowMultiple?: boolean;
  menuPopupClassName?: string;
  enableShortcut?: boolean;
  shortcutKey?: string;
  shortcutLabel?: string;
  i18n: FilterI18nConfig;
  onLastAddedFilterChange: (filterId: string | null) => void;
}

export function AddFilterMenu<T = unknown>({
  filters,
  fields,
  onChange,
  trigger,
  showSearchInput = true,
  allowMultiple = true,
  menuPopupClassName,
  enableShortcut = false,
  shortcutKey = "f",
  shortcutLabel = "F",
  i18n,
  onLastAddedFilterChange,
}: AddFilterMenuProps<T>) {
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  const [menuSearchInput, setMenuSearchInput] = useState("");
  const [activeMenu, setActiveMenu] = useState("root");
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [sessionFilterIds, setSessionFilterIds] = useState<
    Record<string, string>
  >({});
  const rootInputRef = useRef<HTMLInputElement>(null);
  const rootId = useId();

  useEffect(() => {
    if (!enableShortcut) {
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key.toLowerCase() === shortcutKey.toLowerCase() &&
        !addFilterOpen &&
        !(
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        setAddFilterOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut, shortcutKey, addFilterOpen]);

  useEffect(() => {
    if (addFilterOpen && activeMenu === "root") {
      rootInputRef.current?.focus();
    }
  }, [addFilterOpen, activeMenu]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [menuSearchInput]);

  useEffect(() => {
    if (highlightedIndex >= 0 && addFilterOpen) {
      scrollOptionIntoView(rootId, highlightedIndex);
    }
  }, [highlightedIndex, addFilterOpen, rootId]);

  useEffect(() => {
    if (!addFilterOpen) {
      setOpenSubMenu(null);
    }
  }, [addFilterOpen]);

  const selectableFields = useMemo(() => {
    const flatFields = flattenFields(fields);
    return flatFields.filter((field) => {
      if (!field.key || field.type === "separator") {
        return false;
      }

      if (allowMultiple) {
        return true;
      }

      return !filters.some((filter) => filter.field === field.key);
    });
  }, [fields, filters, allowMultiple]);

  const filteredFields = useMemo(
    () =>
      selectableFields.filter(
        (field) =>
          !menuSearchInput ||
          field.label?.toLowerCase().includes(menuSearchInput.toLowerCase())
      ),
    [selectableFields, menuSearchInput]
  );

  useEffect(() => {
    if (addFilterOpen && filteredFields.length > 0) {
      setHighlightedIndex(0);
    }
  }, [addFilterOpen, filteredFields.length]);

  function addFilter(fieldKey: string) {
    const field = selectableFields.find(
      (currentField) => currentField.key === fieldKey
    );
    if (field?.key) {
      const defaultOperator =
        field.defaultOperator ||
        (field.type === "multiselect" ? "is_any_of" : "is");
      const defaultValues: unknown[] = field.type === "text" ? [""] : [];
      const newFilter = createFilter<T>(
        fieldKey,
        defaultOperator,
        defaultValues as T[]
      );

      onLastAddedFilterChange(newFilter.id);
      onChange([...filters, newFilter]);
      setAddFilterOpen(false);
      setMenuSearchInput("");
    }
  }

  function updateRootHighlight(direction: "next" | "previous") {
    if (filteredFields.length === 0) {
      return;
    }

    setHighlightedIndex((previousIndex) => {
      if (direction === "next") {
        return previousIndex < filteredFields.length - 1
          ? previousIndex + 1
          : 0;
      }

      return previousIndex > 0 ? previousIndex - 1 : filteredFields.length - 1;
    });
  }

  function toggleHighlightedField() {
    const field = filteredFields[highlightedIndex];
    if (!field?.key) {
      return;
    }

    const hasSubMenu = Boolean(
      (field.type === "select" || field.type === "multiselect") &&
      field.options?.length
    );

    if (hasSubMenu) {
      if (openSubMenu === field.key) {
        setOpenSubMenu(null);
        setActiveMenu("root");
      } else {
        setOpenSubMenu(field.key);
        setActiveMenu(field.key);
      }
      return;
    }

    addFilter(field.key);
  }

  function handleRootHorizontalNavigation(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (highlightedIndex < 0) {
      return;
    }

    const field = filteredFields[highlightedIndex];
    const hasSubMenu = Boolean(
      field &&
      (field.type === "select" || field.type === "multiselect") &&
      field.options?.length
    );

    if (e.key === "ArrowRight" && hasSubMenu) {
      e.preventDefault();
      setOpenSubMenu(field?.key || null);
      setActiveMenu(field?.key || "root");
    } else if (e.key === "ArrowLeft" && openSubMenu !== null) {
      e.preventDefault();
      setOpenSubMenu(null);
      setActiveMenu("root");
    }
  }

  function handleRootInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      updateRootHighlight("next");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      updateRootHighlight("previous");
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      handleRootHorizontalNavigation(e);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      toggleHighlightedField();
    } else if (e.key === "Escape") {
      setAddFilterOpen(false);
    }

    e.stopPropagation();
  }

  const triggerButton = useRender({
    defaultTagName: "button",
    render: trigger as React.ReactElement,
  });

  if (selectableFields.length === 0) {
    return null;
  }

  return (
    <DropdownMenu
      open={addFilterOpen}
      onOpenChange={(open) => {
        setAddFilterOpen(open);
        if (open) {
          setActiveMenu("root");
          return;
        }

        setMenuSearchInput("");
        setSessionFilterIds({});
      }}
    >
      <DropdownMenuTrigger render={triggerButton} />
      <DropdownMenuContent
        className={cn("w-55", menuPopupClassName)}
        align="start"
      >
        {showSearchInput && (
          <>
            <div className="relative">
              <Input
                ref={rootInputRef}
                aria-expanded={openSubMenu !== null}
                aria-controls={`${rootId}-listbox`}
                aria-activedescendant={
                  highlightedIndex >= 0
                    ? `${rootId}-item-${highlightedIndex}`
                    : undefined
                }
                placeholder={i18n.searchFields}
                className={cn(
                  "h-8 rounded-none border-0 bg-transparent! px-2 text-sm shadow-none",
                  "focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0",
                  activeMenu === "root" && "placeholder:text-foreground"
                )}
                value={menuSearchInput}
                tabIndex={0}
                onFocus={() => setActiveMenu("root")}
                onMouseEnter={() => setActiveMenu("root")}
                onBlur={() =>
                  activeMenu === "root" && rootInputRef.current?.focus()
                }
                onChange={(e) => setMenuSearchInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleRootInputKeyDown}
              />
              {enableShortcut && shortcutLabel && (
                <Kbd className="bg-background absolute top-1/2 right-2 -translate-y-1/2 border">
                  {shortcutLabel}
                </Kbd>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <div className="relative flex max-h-full">
          <div
            className="flex max-h-[min(var(--available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain"
            id={`${rootId}-listbox`}
            tabIndex={-1}
            onMouseEnter={() => setActiveMenu("root")}
          >
            <ScrollArea className="**:data-[slot=scroll-area-scrollbar]:m-0">
              {filteredFields.length === 0 ? (
                <div className="text-muted-foreground py-2 text-center text-sm">
                  {i18n.noFieldsFound}
                </div>
              ) : (
                filteredFields.map((field, index) => {
                  const isHighlighted = highlightedIndex === index;
                  const itemId = `${rootId}-item-${index}`;
                  const hasSubMenu =
                    (field.type === "select" || field.type === "multiselect") &&
                    field.options?.length;

                  if (hasSubMenu) {
                    const isMultiSelect = field.type === "multiselect";
                    const fieldKey = field.key as string;
                    const sessionFilterId = sessionFilterIds[fieldKey];
                    const sessionFilter = sessionFilterId
                      ? filters.find((filter) => filter.id === sessionFilterId)
                      : null;
                    const currentValues = sessionFilter?.values || [];

                    return (
                      <DropdownMenuSub
                        key={fieldKey}
                        open={openSubMenu === fieldKey}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenSubMenu(fieldKey);
                          } else if (openSubMenu === fieldKey) {
                            setOpenSubMenu(null);
                            setActiveMenu("root");
                          }
                        }}
                      >
                        <DropdownMenuSubTrigger
                          id={itemId}
                          tabIndex={-1}
                          data-highlighted={isHighlighted || undefined}
                          onMouseEnter={() => {
                            setHighlightedIndex(index);
                            setActiveMenu("root");
                          }}
                          className="data-popup-open:bg-accent data-popup-open:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                        >
                          {field.icon}
                          <span>{field.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-50" side="right">
                          <FilterSubmenuContent
                            field={field}
                            currentValues={currentValues}
                            isMultiSelect={isMultiSelect}
                            i18n={i18n}
                            isActive={activeMenu === fieldKey}
                            onActive={() => {
                              if (field.searchable === false) {
                                return;
                              }

                              setActiveMenu(fieldKey);
                            }}
                            onBack={() => {
                              setOpenSubMenu(null);
                              setActiveMenu("root");
                            }}
                            onClose={() => setAddFilterOpen(false)}
                            onToggle={(value, isSelected) => {
                              if (isMultiSelect) {
                                const nextValues = isSelected
                                  ? (currentValues.filter(
                                      (currentValue) => currentValue !== value
                                    ) as T[])
                                  : ([...currentValues, value] as T[]);

                                if (sessionFilter) {
                                  if (nextValues.length === 0) {
                                    onChange(
                                      filters.filter(
                                        (filter) =>
                                          filter.id !== sessionFilter.id
                                      )
                                    );
                                    setSessionFilterIds((previousValue) => ({
                                      ...previousValue,
                                      [fieldKey]: "",
                                    }));
                                  } else {
                                    onChange(
                                      filters.map((filter) =>
                                        filter.id === sessionFilter.id
                                          ? { ...filter, values: nextValues }
                                          : filter
                                      )
                                    );
                                  }
                                } else {
                                  const newFilter = createFilter<T>(
                                    fieldKey,
                                    field.defaultOperator || "is_any_of",
                                    nextValues
                                  );
                                  onChange([...filters, newFilter]);
                                  setSessionFilterIds((previousValue) => ({
                                    ...previousValue,
                                    [fieldKey]: newFilter.id,
                                  }));
                                }
                              } else {
                                const newFilter = createFilter<T>(
                                  fieldKey,
                                  field.defaultOperator || "is",
                                  [value] as T[]
                                );
                                onLastAddedFilterChange(newFilter.id);
                                onChange([...filters, newFilter]);
                                setAddFilterOpen(false);
                              }
                            }}
                          />
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  }

                  return (
                    <DropdownMenuItem
                      key={field.key}
                      id={itemId}
                      tabIndex={-1}
                      data-highlighted={isHighlighted || undefined}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => field.key && addFilter(field.key)}
                      className="data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                    >
                      {field.icon}
                      <span>{field.label}</span>
                    </DropdownMenuItem>
                  );
                })
              )}
            </ScrollArea>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
