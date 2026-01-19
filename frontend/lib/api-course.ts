import api from './api';
import { studentApi } from './api-student';

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  _count?: {
    courses: number;
    students: number;
  };
}

export interface Course {
  id: number;
  code: string;
  title: string;
  description?: string;
  credits: number;
  departmentId: number;
  level: number;
  semester: number; // 1 or 2
  prerequisite?: string;
  isElective?: boolean;
  department?: Department;
  _count?: {
    courseRegistrations: number;
  };
}

export interface CourseRegistrationItem {
  courseId: number;
  course?: Course;
}

export interface CourseRegistration {
  id: number;
  studentId: number;
  sessionId: number;
  semesterId: number;
  level: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  totalUnits: number;
  courses: CourseRegistrationItem[];
  carryOverCourses?: Array<{
    id: number;
    courseId: number;
    type: 'CARRY_OVER';
    retakeType?: 'EXAM_ONLY' | 'FULL_COURSE';
    previousAttempts: number;
    course?: Course;
  }>;
  comments?: string;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  student?: {
    id: number;
    matricNo: string;
    firstName: string;
    lastName: string;
    email: string;
    currentLevel: number;
    department?: Department;
  };
  session?: {
    id: number;
    name: string;
  };
  semester?: {
    id: number;
    type: string;
  };
}

export interface RegistrationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalUnits: number;
}

// API Methods
export const courseApi = {
  // ==================== DEPARTMENTS ====================
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    return response.data.data || [];
  },

  getDepartment: async (id: number): Promise<Department> => {
    const response = await api.get(`/departments/${id}`);
    return response.data.data;
  },

  // ==================== COURSES ====================
  getCourses: async (params?: {
    departmentId?: number;
    level?: number;
    semester?: number;
    search?: string;
    limit?: number;
  }): Promise<Course[]> => {
    const queryParams = new URLSearchParams();
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId.toString());
    if (params?.level) queryParams.append('level', params.level.toString());
    if (params?.semester) queryParams.append('semester', params.semester.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/courses?${queryParams.toString()}`);
    return response.data.data || [];
  },

  getCourse: async (id: number): Promise<Course> => {
    const response = await api.get(`/courses/${id}`);
    return response.data.data;
  },

  createCourse: async (data: {
    code: string;
    title: string;
    description?: string;
    credits: number;
    departmentId: number;
    level: number;
    semester: number;
    prerequisite?: string;
    isElective?: boolean;
  }): Promise<Course> => {
    const response = await api.post('/courses', data);
    return response.data.data;
  },

  updateCourse: async (id: number, data: Partial<Course>): Promise<Course> => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data.data;
  },

  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },

  // ==================== STUDENT COURSE REGISTRATION ====================
  getAvailableCourses: async (params: {
    sessionId: number;
    semesterId: number;
    level: number;
  }): Promise<Course[]> => {
    const queryParams = new URLSearchParams({
      sessionId: params.sessionId.toString(),
      semesterId: params.semesterId.toString(),
      level: params.level.toString(),
    });

    const response = await studentApi.get(`/courses/available?${queryParams.toString()}`);
    const data = response.data.data || response.data;
    // Old controller returns { courses: [], student: {}, session: {}, ... }
    // New controller returns just array of courses
    return Array.isArray(data) ? data : (data.courses || []);
  },

  validateRegistration: async (data: {
    courseIds: number[];
    level: number;
    sessionId: number;
    semesterId: number;
  }): Promise<RegistrationValidation> => {
    const response = await studentApi.post('/courses/validate', data);
    return response.data;
  },

  submitRegistration: async (data: {
    sessionId: number;
    semesterId: number;
    level: number;
    courseIds: number[];
    carryOverCourses?: Array<{ courseId: number; retakeType: string }>;
  }): Promise<CourseRegistration> => {
    const response = await studentApi.post('/courses/register', data);
    return response.data.data;
  },

  getMyRegistrations: async (params?: {
    sessionId?: number;
    semesterId?: number;
  }): Promise<CourseRegistration[]> => {
    const queryParams = new URLSearchParams();
    if (params?.sessionId) queryParams.append('sessionId', params.sessionId.toString());
    if (params?.semesterId) queryParams.append('semesterId', params.semesterId.toString());

    const response = await studentApi.get(`/courses/my-registrations?${queryParams.toString()}`);
    return response.data.data || [];
  },

  getRegistrationDetails: async (id: number): Promise<CourseRegistration> => {
    const response = await studentApi.get(`/courses/registrations/${id}`);
    return response.data.data;
  },

  downloadCourseForm: async (registrationId: number): Promise<Blob> => {
    const response = await studentApi.get(`/courses/registrations/${registrationId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ==================== ADMIN REGISTRATION MANAGEMENT ====================
  getAllRegistrations: async (params?: {
    sessionId?: number;
    semesterId?: number;
    departmentId?: number;
    level?: number;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CourseRegistration[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.sessionId) queryParams.append('sessionId', params.sessionId.toString());
    if (params?.semesterId) queryParams.append('semesterId', params.semesterId.toString());
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId.toString());
    if (params?.level) queryParams.append('level', params.level.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/course-registrations?${queryParams.toString()}`);
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {},
    };
  },

  approveRegistration: async (id: number, comments?: string): Promise<CourseRegistration> => {
    const response = await api.post(`/admin/course-registrations/${id}/approve`, { comments });
    return response.data.data;
  },

  rejectRegistration: async (id: number, comments: string): Promise<CourseRegistration> => {
    const response = await api.post(`/admin/course-registrations/${id}/reject`, { comments });
    return response.data.data;
  },

  returnRegistration: async (id: number, comments: string): Promise<CourseRegistration> => {
    const response = await api.post(`/admin/course-registrations/${id}/return`, { comments });
    return response.data.data;
  },

  // ==================== REGISTRATION SETTINGS ====================
  getRegistrationStatus: async (params: {
    sessionId: number;
    semesterId: number;
  }): Promise<{ isOpen: boolean; message?: string }> => {
    const queryParams = new URLSearchParams({
      sessionId: params.sessionId.toString(),
      semesterId: params.semesterId.toString(),
    });

    const response = await api.get(`/student/courses/registration-status?${queryParams.toString()}`);
    return response.data;
  },

  toggleRegistration: async (data: {
    sessionId: number;
    semesterId: number;
    isOpen: boolean;
  }): Promise<void> => {
    await api.post('/admin/courses/registration-settings', data);
  },

  // ==================== REPORTS ====================
  exportRegistrations: async (params: {
    sessionId: number;
    semesterId?: number;
    departmentId?: number;
    level?: number;
    format?: 'csv' | 'excel';
  }): Promise<Blob> => {
    const queryParams = new URLSearchParams({
      sessionId: params.sessionId.toString(),
      format: params.format || 'csv',
    });
    if (params.semesterId) queryParams.append('semesterId', params.semesterId.toString());
    if (params.departmentId) queryParams.append('departmentId', params.departmentId.toString());
    if (params.level) queryParams.append('level', params.level.toString());

    const response = await api.get(`/admin/course-registrations/export?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getRegistrationStats: async (params: {
    sessionId: number;
    semesterId?: number;
  }): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    returned: number;
    byDepartment: Array<{ department: string; count: number }>;
    byLevel: Array<{ level: number; count: number }>;
  }> => {
    const queryParams = new URLSearchParams({
      sessionId: params.sessionId.toString(),
    });
    if (params.semesterId) queryParams.append('semesterId', params.semesterId.toString());

    const response = await api.get(`/admin/course-registrations/stats?${queryParams.toString()}`);
    return response.data.data;
  },
};

export default courseApi;
