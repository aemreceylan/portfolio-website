import { WindowSize } from './window';
import type { ContainerConfig } from '../schemas/manifest.schema';

/**
 * Category classification for OS applications
 */
export type AppCategory = 'projects' | 'system' | 'utilities';

/**
 * Metadata specifically attached to portfolio SPA project applications
 */
export interface ProjectAppMetadata {
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  isSelfHosted?: boolean;
  architectureOverview?: string;
  caseStudyNotes?: string[];
  lighthouseScore?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

/**
 * Base manifest defining an application in NovaOS
 */
export interface AppManifest {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: AppCategory;
  defaultSize: WindowSize;
  minSize: WindowSize;
  resizable: boolean;
  singleton: boolean;
  isDynamic?: boolean;
  metadata?: ProjectAppMetadata;
  container?: ContainerConfig;
}
