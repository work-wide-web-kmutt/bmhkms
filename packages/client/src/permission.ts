import { createAccessControl } from "better-auth/plugins/access";

import { permissionStatements, roleDefinitions } from "./roles";

export const ac = createAccessControl(permissionStatements);

export const admin = ac.newRole(roleDefinitions.admin);

export const contestant = ac.newRole(roleDefinitions.contestant);

export const observer = ac.newRole(roleDefinitions.observer);

export const records_staff = ac.newRole(roleDefinitions.records_staff);

export const root = ac.newRole(roleDefinitions.root);

export const staff = ac.newRole(roleDefinitions.staff);
