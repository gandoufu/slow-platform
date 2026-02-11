import api from '../utils/api';
import type { Api, ApiCreate, ApiUpdate } from '../types/interface';

export const getApis = (projectId: number, params?: { module_name?: string }) => {
  return api.get<any, Api[]>(`/projects/${projectId}/apis/`, { params });
};

export const getApi = (projectId: number, apiId: number) => {
  return api.get<any, Api>(`/projects/${projectId}/apis/${apiId}`);
};

export const createApi = (projectId: number, data: ApiCreate) => {
  return api.post<any, Api>(`/projects/${projectId}/apis/`, data);
};

export const updateApi = (projectId: number, apiId: number, data: ApiUpdate) => {
  return api.put<any, Api>(`/projects/${projectId}/apis/${apiId}`, data);
};

export const deleteApi = (projectId: number, apiId: number) => {
  return api.delete<any, Api>(`/projects/${projectId}/apis/${apiId}`);
};
