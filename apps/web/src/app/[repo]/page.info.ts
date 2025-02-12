import { z } from "zod";

export const Route = {
  name: "Repo",
  params: z.object({
    repo: z.string(),
  })
};

