export interface Project {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface Environment {
  id: number;
  name: string;
  code: string;
  base_url: string;
  description: string | null;
  is_default: boolean;
  project_id: number;
}

export interface EnvironmentCreate {
  name: string;
  code: string;
  base_url: string;
  description?: string;
}

export interface EnvironmentUpdate {
  name?: string;
  code?: string;
  base_url?: string;
  description?: string;
}
