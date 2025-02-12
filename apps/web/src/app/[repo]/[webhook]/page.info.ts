import { z } from "zod";

export const Route = {
  name: "RepoWebhook",
  params: z.object({
    repo: z.string(),
    webhook: z.string(),
  })
};

