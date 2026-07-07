import * as reactRouter from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StaffDirectoryTable } from "@/features/admin/staff-directory/table";

export const Route = reactRouter.createFileRoute("/_protected/admin/staff")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container space-y-4 px-4 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            Mock staff records for the admin directory table.
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
