import { z } from 'zod';

export const windowSizeSchema = z.object({
  width: z.number().int().min(200).max(3840),
  height: z.number().int().min(150).max(2160),
});

export const projectAppMetadataSchema = z.object({
  techStack: z.array(z.string().min(1).max(50)).min(1),
  liveUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  isSelfHosted: z.boolean().optional(),
  architectureOverview: z.string().max(2000).optional(),
  caseStudyNotes: z.array(z.string().max(1000)).optional(),
  lighthouseScore: z
    .object({
      performance: z.number().min(0).max(100),
      accessibility: z.number().min(0).max(100),
      bestPractices: z.number().min(0).max(100),
      seo: z.number().min(0).max(100),
    })
    .optional(),
});

export const appManifestSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'App ID must be lowercase alphanumeric and dashes only'),
  name: z.string().min(2).max(100),
  description: z.string().min(5).max(300),
  iconName: z.string().min(2).max(50),
  category: z.enum(['projects', 'system', 'utilities']),
  defaultSize: windowSizeSchema,
  minSize: windowSizeSchema,
  resizable: z.boolean().default(true),
  singleton: z.boolean().default(true),
  isDynamic: z.boolean().optional(),
  metadata: projectAppMetadataSchema.optional(),
});

export type ValidatedAppManifest = z.infer<typeof appManifestSchema>;
