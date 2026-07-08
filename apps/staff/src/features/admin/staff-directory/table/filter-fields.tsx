import { MailIcon, UserIcon } from "lucide-react";

import type { FilterFieldConfig } from "@/components/ui/filters";

export const staffDirectoryFilterFields: FilterFieldConfig<string>[] = [
  {
    className: "w-40",
    icon: <UserIcon aria-hidden="true" />,
    key: "name",
    label: "Name",
    placeholder: "Search names...",
    type: "text",
  },
  {
    className: "w-48",
    icon: <MailIcon aria-hidden="true" />,
    key: "email",
    label: "Email",
    placeholder: "Search email...",
    type: "text",
  },
];
