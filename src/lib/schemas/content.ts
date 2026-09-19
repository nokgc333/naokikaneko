import { z } from "zod";

export const contentFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  date: z.string().min(1),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  url: z.string().optional(),
  description: z.string().min(1),
});

export type ContentFrontmatter = z.infer<typeof contentFrontmatterSchema>;

export type ContentEntry = ContentFrontmatter & { body: string };
