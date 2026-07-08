import type { StaffListItem } from "@bmhkms/api/schemas/staff";
import type { CellContext, ColumnDef } from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/features/user/avatar";

type StaffDirectoryRow = StaffListItem;

function renderNameCell({ row }: { row: { original: StaffDirectoryRow } }) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        className="size-6"
        image={row.original.image}
        name={row.original.name}
      />
      <span className="font-medium text-foreground">{row.original.name}</span>
    </div>
  );
}

function renderEmailCell(info: CellContext<StaffDirectoryRow, unknown>) {
  const email = info.getValue() as string;
  return (
    <a className="hover:text-primary hover:underline" href={`mailto:${email}`}>
      {email}
    </a>
  );
}

const staffDirectoryColumns: ColumnDef<StaffDirectoryRow>[] = [
  {
    accessorKey: "name",
    cell: renderNameCell,
    enableHiding: false,
    enableSorting: true,
    header: "Name",
    id: "name",
    meta: {
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    size: 200,
  },
  {
    accessorKey: "email",
    cell: renderEmailCell,
    enableHiding: false,
    enableSorting: true,
    header: "Email",
    meta: {
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    size: 175,
  },
];

export { staffDirectoryColumns };
