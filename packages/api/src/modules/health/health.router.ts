import { publicProcedure } from "../../procedures";

export const healthRouter = {
  check: publicProcedure.handler(() => "OK"),
};
