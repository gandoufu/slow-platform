import api from '../utils/api';
import type { DebugRequest, DebugResponse } from '../types/debug';

export const debugRun = (data: DebugRequest) => {
  return api.post<any, DebugResponse>('/debug/run', data);
};
