import api from '../utils/api';
import type { Project, ProjectCreate, Environment, EnvironmentCreate } from '../types/project';

export const getProjects = () => {
  return api.get<any, Project[]>('/projects/');
};

export const getProject = (id: number) => {
  return api.get<any, Project>(`/projects/${id}`);
};

export const createProject = (data: ProjectCreate) => {
  return api.post<any, Project>('/projects/', data);
};

export const createEnvironment = (projectId: number, data: EnvironmentCreate) => {
  return api.post<any, Environment>(`/projects/${projectId}/environments/`, data);
};
