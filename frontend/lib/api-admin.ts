import api from './api';

export interface Session {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  semesters?: Semester[];
}

export interface Semester {
  id: number;
  sessionId: number;
  type: 'FIRST' | 'SECOND';
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

// Admin API for sessions and other admin-specific endpoints
export const adminApi = {
  // ==================== SESSIONS ====================
  getAllSessions: async (): Promise<Session[]> => {
    const response = await api.get('/admin/sessions');
    return response.data.data || [];
  },

  getActiveSession: async (): Promise<Session> => {
    const response = await api.get('/admin/sessions/active');
    return response.data.data;
  },

  getSession: async (id: number): Promise<Session> => {
    const response = await api.get(`/admin/sessions/${id}`);
    return response.data.data;
  },

  createSession: async (data: {
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }): Promise<Session> => {
    const response = await api.post('/admin/sessions', data);
    return response.data.data;
  },

  updateSession: async (id: number, data: Partial<Session>): Promise<Session> => {
    const response = await api.patch(`/admin/sessions/${id}`, data);
    return response.data.data;
  },

  deleteSession: async (id: number): Promise<void> => {
    await api.delete(`/admin/sessions/${id}`);
  },

  // ==================== SEMESTERS ====================
  getSessionSemesters: async (sessionId: number): Promise<Semester[]> => {
    const response = await api.get(`/admin/sessions/${sessionId}/semesters`);
    return response.data.data || [];
  },

  getActiveSemester: async (): Promise<Semester> => {
    const response = await api.get('/admin/sessions/semesters/active');
    return response.data.data;
  },

  createSemester: async (sessionId: number, data: {
    type: 'FIRST' | 'SECOND';
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }): Promise<Semester> => {
    const response = await api.post(`/admin/sessions/${sessionId}/semesters`, data);
    return response.data.data;
  },

  updateSemester: async (id: number, data: Partial<Semester>): Promise<Semester> => {
    const response = await api.patch(`/admin/sessions/semesters/${id}`, data);
    return response.data.data;
  },

  deleteSemester: async (id: number): Promise<void> => {
    await api.delete(`/admin/sessions/semesters/${id}`);
  },
};

export default adminApi;
