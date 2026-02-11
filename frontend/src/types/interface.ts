export interface ApiRequestTemplate {
  path_params?: Record<string, any>;
  query_params?: Record<string, any>;
  headers?: Record<string, any>;
  body?: any;
  body_type?: string;
}

export interface Api {
  id: number;
  project_id: number;
  module_name: string | null;
  name: string;
  method: string;
  url_path: string;
  description: string | null;
  request_template: ApiRequestTemplate | null;
  created_at: string;
  updated_at: string;
}

export interface ApiCreate {
  project_id: number;
  name: string;
  method: string;
  url_path: string;
  module_name?: string;
  description?: string;
  request_template?: ApiRequestTemplate;
}

export interface ApiUpdate {
  name?: string;
  method?: string;
  url_path?: string;
  module_name?: string;
  description?: string;
  request_template?: ApiRequestTemplate;
}
