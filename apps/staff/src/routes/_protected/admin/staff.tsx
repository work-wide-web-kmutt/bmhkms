import * as reactRouter from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StaffDirectoryTable } from "@/features/admin/staff-directory/table";
import { staffDirectorySearchSchema } from "@/features/admin/staff-directory/table/search";

export const Route = reactRouter.createFileRoute("/_protected/admin/staff")({
  component: RouteComponent,
  validateSearch: zodValidator(staffDirectorySearchSchema),
});

function RouteComponent() {
  return (
    <div className="container space-y-4 px-4 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            Live staff directory records loaded from the API.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1">
          <Card>
            <CardContent>
              <StaffDirectoryTable />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
