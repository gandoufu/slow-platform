export interface DebugRequest {
  method: string;
  url: string;
  params?: Record<string, any>;
  headers?: Record<string, any>;
  body?: any;
  body_type?: string;
  environment_id?: number;
}

export interface DebugResponse {
  status_code: number;
  headers: Record<string, any>;
  body: any;
  duration: number;
  error?: string;
}
