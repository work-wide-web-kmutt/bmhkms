import { FunnelXIcon, ListFilterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Filters } from "@/components/ui/filters";
import type { Filter } from "@/components/ui/filters";

import { staffDirectoryFilterFields } from "./filter-fields";

interface StaffDirectoryFilterToolbarProps {
  filters: Filter<string>[];
  hasActiveFilters: boolean;
  isFilterCommitPending: boolean;
  isUpdating: boolean;
  onClearFilters: () => void;
  onFiltersChange: (filters: Filter<string>[]) => void;
}

export function StaffDirectoryFilterToolbar({
  filters,
  hasActiveFilters,
  isFilterCommitPending,
  isUpdating,
  onClearFilters,
  onFiltersChange,
}: StaffDirectoryFilterToolbarProps) {
  let statusMessage: string | null = null;

  if (isFilterCommitPending) {
    statusMessage = "Applying filters...";
  } else if (isUpdating) {
    statusMessage = "Updating...";
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start gap-2.5">
        <div className="flex-1">
          <Filters<string>
            fields={staffDirectoryFilterFields}
            filters={filters}
            onChange={onFiltersChange}
            size="sm"
            trigger={
              <Button
                aria-label="Open staff filters"
                size="icon-sm"
                variant="outline"
              >
                <ListFilterIcon aria-hidden="true" />
                <span className="sr-only">Open staff filters</span>
              </Button>
            }
          />
        </div>
        {hasActiveFilters ? (
          <Button onClick={onClearFilters} size="sm" variant="outline">
            <FunnelXIcon aria-hidden="true" data-icon="inline-start" />
            Clear
          </Button>
        ) : null}
      </div>
      <output
        aria-live="polite"
        className="text-muted-foreground min-h-5 text-sm"
      >
        {statusMessage}
      </output>
    </div>
  );
}
