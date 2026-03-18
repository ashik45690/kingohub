import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

const dashboardService = {
    getStats: async (examId) => {
        if (examId) {
            const response = await api.get(`/exams/${examId}/analytics`);
            return unwrap(response);
        }
        const response = await api.get('/dashboard/stats');
        return unwrap(response);
    }
};

export default dashboardService;
