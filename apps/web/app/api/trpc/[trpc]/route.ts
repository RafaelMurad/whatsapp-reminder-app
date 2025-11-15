import { appRouter, createContext } from "@repo/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: ({ req }) => createContext({ headers: req.headers }),
  });
};

export { handler as GET, handler as POST };
