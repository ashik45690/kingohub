import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

const submissionService = {
    submitExam: async (submissionData) => {
        const response = await api.post('/submissions', submissionData);
        return unwrap(response);
    },
    getExamSubmissions: async (examId) => {
        const response = await api.get(`/submissions/exam/${examId}`);
        return unwrap(response) || [];
    },
    getUserSubmission: async (examId, userId) => {
        const response = await api.get(`/submissions/exam/${examId}/user/${userId}`);
        return unwrap(response);
    }
};

export default submissionService;
