import api from '../utils/api';
import type { TestCase, TestCaseCreate, TestCaseUpdate, TestRunResult } from '../types/testCase';

export const getTestCases = (projectId: number) => {
  return api.get<any, TestCase[]>(`/projects/${projectId}/test-cases/`);
};

export const getTestCase = (projectId: number, testCaseId: number) => {
  return api.get<any, TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`);
};

export const createTestCase = (projectId: number, data: TestCaseCreate) => {
  return api.post<any, TestCase>(`/projects/${projectId}/test-cases/`, data);
};

export const updateTestCase = (projectId: number, testCaseId: number, data: TestCaseUpdate) => {
  return api.put<any, TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`, data);
};

export const deleteTestCase = (projectId: number, testCaseId: number) => {
  return api.delete<any, TestCase>(`/projects/${projectId}/test-cases/${testCaseId}`);
};

export const runTestCase = (projectId: number, testCaseId: number, environmentId: number) => {
  return api.post<any, TestRunResult>(`/projects/${projectId}/test-cases/${testCaseId}/run?environment_id=${environmentId}`);
};
