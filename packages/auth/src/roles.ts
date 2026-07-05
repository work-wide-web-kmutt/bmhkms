import { adminAc } from "better-auth/plugins/admin/access";

export const actions = {
  records: {
    access: "access",
  },
  staff: {
    access: "access",
    approval: "approval",
  },
} as const;

export const permissionStatements = {
  ...adminAc.statements,
  records: [actions.records.access],
  staff: [actions.staff.access, actions.staff.approval],
} as const;

export const roleNames = [
  "admin",
  "contestant",
  "observer",
  "records_staff",
  "root",
  "staff",
] as const;

export type RoleName = (typeof roleNames)[number];

type RoleDefinitionMap = Record<
  RoleName,
  Partial<{
    [Key in keyof typeof permissionStatements]: readonly (typeof permissionStatements)[Key][number][];
  }>
>;

export const roleDefinitions = {
  admin: {
    ...adminAc.statements,
    records: permissionStatements.records,
    staff: permissionStatements.staff,
  },
  contestant: {},
  observer: {},
  records_staff: {
    records: permissionStatements.records,
    staff: [actions.staff.access],
  },
  root: {
    ...adminAc.statements,
    records: permissionStatements.records,
    staff: permissionStatements.staff,
  },
  staff: {
    staff: [actions.staff.access],
  },
} as const satisfies RoleDefinitionMap;
