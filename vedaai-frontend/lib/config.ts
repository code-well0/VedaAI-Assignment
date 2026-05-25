export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || API_BASE_URL;

export const TEACHERS_API = `${API_BASE_URL}/api/teachers`;
export const ASSIGNMENTS_API = `${API_BASE_URL}/api/assignments`;
