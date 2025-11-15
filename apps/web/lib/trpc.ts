import { type AppRouter } from "@repo/api";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();

export const createTRPCClient = () => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/api/trpc",
        headers() {
          return {
            // Add auth headers here later
          };
        },
      }),
    ],
  });
};
