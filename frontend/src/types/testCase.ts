export interface Assertion {
  source: 'status_code' | 'header' | 'body' | 'response_time';
  expression?: string; // key or jsonpath
  operator: 'eq' | 'gt' | 'lt' | 'contains';
  value: string | number;
}

export interface TestCase {
  id: number;
  project_id: number;
  api_id?: number;
  name: string;
  description?: string;
  method: string;
  url: string;
  headers?: Record<string, any>;
  params?: Record<string, any>;
  body?: any;
  body_type: string;
  assertions?: Assertion[];
  created_at: string;
  updated_at: string;
}

export interface TestCaseCreate {
  project_id: number;
  api_id?: number;
  name: string;
  description?: string;
  method: string;
  url: string;
  headers?: Record<string, any>;
  params?: Record<string, any>;
  body?: any;
  body_type?: string;
  assertions?: Assertion[];
}

export interface TestCaseUpdate {
  name?: string;
  description?: string;
  method?: string;
  url?: string;
  headers?: Record<string, any>;
  params?: Record<string, any>;
  body?: any;
  body_type?: string;
  assertions?: Assertion[];
}

export interface AssertionResult extends Assertion {
    actual_value: any;
    passed: boolean;
    error?: string;
}

export interface TestRunResult {
    result: {
        status_code: number;
        headers: any;
        body: any;
        duration: number;
        error?: string;
    };
    assertions: AssertionResult[];
    passed: boolean;
}
