import { ButtonGroupText } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

import { FilterInput } from "./filter-input";
import { SelectOptionsPopover } from "./select-options-popover";
import type { FilterFieldConfig } from "./types";

interface FilterValueSelectorProps<T = unknown> {
  field: FilterFieldConfig<T>;
  values: T[];
  onChange: (values: T[]) => void;
  operator: string;
  autoFocus?: boolean;
}

export function FilterValueSelector<T = unknown>({
  field,
  values,
  onChange,
  operator,
  autoFocus,
}: FilterValueSelectorProps<T>) {
  if (operator === "empty" || operator === "not_empty") {
    return null;
  }

  if (field.customRenderer) {
    return (
      <ButtonGroupText className="hover:bg-accent aria-expanded:bg-accent bg-background dark:bg-input/30 text-start whitespace-nowrap outline-hidden">
        {field.customRenderer({ field, onChange, operator, values })}
      </ButtonGroupText>
    );
  }

  if (field.type === "text") {
    return (
      <FilterInput
        type="text"
        value={(values[0] as string) || ""}
        onChange={(e) => onChange([e.target.value] as T[])}
        placeholder={field.placeholder}
        pattern={field.pattern}
        field={field}
        className={cn("w-36", field.className)}
        autoFocus={autoFocus}
      />
    );
  }

  return (
    <SelectOptionsPopover field={field} values={values} onChange={onChange} />
  );
}
