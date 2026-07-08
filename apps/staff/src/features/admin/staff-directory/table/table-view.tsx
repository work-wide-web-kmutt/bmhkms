import { CircleAlertIcon, RefreshCwIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid/pagination";
import { DataGridScrollArea } from "@/components/ui/data-grid/scroll-area";
import { DataGridTable } from "@/components/ui/data-grid/table";

import { StaffDirectoryFilterToolbar } from "./filter-toolbar";
import { useStaffDirectoryTable } from "./query-adapter";

function StaffDirectoryErrorState({
  description,
  onRetry,
  title,
  variant = "destructive",
}: {
  description: string;
  onRetry: () => void;
  title: string;
  variant?: "default" | "destructive";
}) {
  return (
    <Alert variant={variant}>
      <CircleAlertIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <AlertAction>
        <Button onClick={onRetry} size="sm" variant="outline">
          <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
          Retry
        </Button>
      </AlertAction>
    </Alert>
  );
}

export function StaffDirectoryTableView() {
  const {
    backgroundErrorMessage,
    draftFilters,
    errorMessage,
    hasActiveFilters,
    isFilterCommitPending,
    isInitialLoading,
    isUpdating,
    onClearFilters,
    onFiltersChange,
    onRetry,
    pageSizes,
    table,
    totalRows,
  } = useStaffDirectoryTable();

  if (errorMessage) {
    return (
      <StaffDirectoryErrorState
        description={errorMessage}
        onRetry={onRetry}
        title="Could not load the staff directory"
      />
    );
  }

  return (
    <DataGrid
      isLoading={isInitialLoading}
      recordCount={totalRows}
      table={table}
    >
      <div className="flex w-full flex-col gap-3">
        <StaffDirectoryFilterToolbar
          filters={draftFilters}
          hasActiveFilters={hasActiveFilters}
          isFilterCommitPending={isFilterCommitPending}
          isUpdating={isUpdating}
          onClearFilters={onClearFilters}
          onFiltersChange={onFiltersChange}
        />
        {backgroundErrorMessage ? (
          <StaffDirectoryErrorState
            description={backgroundErrorMessage}
            onRetry={onRetry}
            title="Showing cached staff records"
            variant="default"
          />
        ) : null}
        <DataGridContainer>
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
        </DataGridContainer>
        <DataGridPagination sizes={pageSizes} />
      </div>
    </DataGrid>
  );
}
