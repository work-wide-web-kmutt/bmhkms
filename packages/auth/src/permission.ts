import { createAccessControl } from "better-auth/plugins/access";
import { adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...adminAc.statements,
  records: ["access"],
  staff: ["access"],
} as const;

export const ac = createAccessControl(statement);

export const contestant = ac.newRole({});

export const observer = ac.newRole({});

export const staff = ac.newRole({
  staff: statement.staff,
});

export const records_staff = ac.newRole({
  records: statement.records,
  staff: statement.staff,
});

export const admin = ac.newRole({
  ...adminAc.statements,
  records: statement.records,
  staff: statement.staff,
});

export const root = ac.newRole({
  ...adminAc.statements,
  records: statement.records,
  staff: statement.staff,
});
