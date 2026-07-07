import type { PaginationState, SortingState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid/pagination";
import { DataGridScrollArea } from "@/components/ui/data-grid/scroll-area";
import { DataGridTable } from "@/components/ui/data-grid/table";

import { staffDirectoryColumns } from "./columns";
import { staffDirectoryMockData } from "./mock-data";

function StaffDirectoryTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: "name" },
  ]);

  const table = useReactTable({
    columns: staffDirectoryColumns,
    data: staffDirectoryMockData,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    pageCount: Math.ceil(staffDirectoryMockData.length / pagination.pageSize),
    state: {
      pagination,
      sorting,
    },
  });

  return (
    <DataGrid recordCount={staffDirectoryMockData.length} table={table}>
      <div className="w-full">
        <DataGridContainer>
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}

export { StaffDirectoryTable };
