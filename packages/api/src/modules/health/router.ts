import { publicProcedure } from "../../base";

export const healthRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
};
