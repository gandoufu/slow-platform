import api from '../utils/api';
import type { Project, ProjectCreate, ProjectUpdate, Environment, EnvironmentCreate, EnvironmentUpdate } from '../types/project';

export const getProjects = () => {
  return api.get<any, Project[]>('/projects/');
};

export const getProject = (id: number) => {
  return api.get<any, Project>(`/projects/${id}`);
};

export const createProject = (data: ProjectCreate) => {
  return api.post<any, Project>('/projects/', data);
};

export const updateProject = (id: number, data: ProjectUpdate) => {
  return api.put<any, Project>(`/projects/${id}`, data);
};

export const deleteProject = (id: number) => {
  return api.delete<any, Project>(`/projects/${id}`);
};

export const createEnvironment = (projectId: number, data: EnvironmentCreate) => {
  return api.post<any, Environment>(`/projects/${projectId}/environments/`, data);
};

export const updateEnvironment = (projectId: number, environmentId: number, data: EnvironmentUpdate) => {
  return api.put<any, Environment>(`/projects/${projectId}/environments/${environmentId}`, data);
};

export const deleteEnvironment = (projectId: number, environmentId: number) => {
  return api.delete<any, Environment>(`/projects/${projectId}/environments/${environmentId}`);
};
