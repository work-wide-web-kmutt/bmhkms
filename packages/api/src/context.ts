import type { Session, User } from "better-auth";

export type AuthSession = {
  session: Session;
  user: User;
} | null;

export interface Context {
  auth: null;
  session: AuthSession;
}
