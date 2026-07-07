"use client";

import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
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
import UserAvatar from "@/features/user/avatar";

import { staffDirectoryMockData } from "./mock-data";
import type { StaffDirectoryRow } from "./mock-data";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

function renderNameCell({ row }: { row: { original: StaffDirectoryRow } }) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        className="size-6"
        image={row.original.avatar}
        name={row.original.name}
      />
      <span className="font-medium text-foreground">{row.original.name}</span>
    </div>
  );
}

function renderEmailCell(info: { getValue: <TValue>() => TValue }) {
  const email = info.getValue<string>();
  return (
    <a className="hover:text-primary hover:underline" href={`mailto:${email}`}>
      {email}
    </a>
  );
}

function renderLocationCell({ row }: { row: { original: StaffDirectoryRow } }) {
  return (
    <div className="flex items-center gap-1.5">
      <img
        alt={`${row.original.location} flag`}
        className="size-4 rounded-full object-cover"
        src={`https://flagcdn.com/${row.original.flag.toLowerCase()}.svg`}
      />
      <span className="font-medium text-foreground">
        {row.original.location}
      </span>
    </div>
  );
}

function renderBalanceCell(info: { getValue: <TValue>() => TValue }) {
  return (
    <span className="font-semibold">
      {currencyFormatter.format(info.getValue<number>())}
    </span>
  );
}

const columns: ColumnDef<StaffDirectoryRow>[] = [
  {
    accessorKey: "name",
    cell: renderNameCell,
    enableHiding: false,
    enableSorting: true,
    header: "Name",
    id: "name",
    size: 200,
  },
  {
    accessorKey: "email",
    cell: renderEmailCell,
    header: "Email",
    size: 175,
  },
  {
    accessorKey: "location",
    cell: renderLocationCell,
    header: "Location",
    meta: {
      cellClassName: "text-start",
    },
    size: 175,
  },
  {
    accessorKey: "balance",
    cell: renderBalanceCell,
    header: "Balance ($)",
    meta: {
      cellClassName: "text-right rtl:text-left",
      headerClassName: "text-right rtl:text-left",
    },
    size: 125,
  },
];

function StaffDirectoryTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: "name" },
  ]);

  const table = useReactTable({
    columns,
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
    <DataGrid
      recordCount={staffDirectoryMockData.length}
      table={table}
      tableLayout={{ dense: true }}
    >
      <div className="w-full space-y-2.5">
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
