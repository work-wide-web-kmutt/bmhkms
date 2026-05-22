import { protectedProcedure } from "../auth/middleware";

export const privateRouter = {
  privateData: protectedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.session?.user,
  })),
};
