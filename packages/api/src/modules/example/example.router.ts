import { protectedProcedure } from "../../procedures";

export const exampleRouter = {
  privateData: protectedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.session.user,
  })),
};
