import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

const examService = {
    createExam: async (examData) => {
        const response = await api.post('/exams', examData);
        return unwrap(response);
    },
    getMyExams: async () => {
        const response = await api.get('/exams/my-exams');
        return unwrap(response) || [];
    },
    getEnrolledExams: async () => {
        const response = await api.get('/exams/enrolled');
        return unwrap(response) || [];
    },
    getExamByCode: async (code) => {
        const response = await api.get(`/exams/search/${code}`);
        return unwrap(response);
    },
    getExamById: async (id) => {
        const response = await api.get(`/exams/${id}`);
        return unwrap(response);
    },
    updateExam: async (id, examData) => {
        const response = await api.put(`/exams/${id}`, examData);
        return unwrap(response);
    },
    deleteExam: async (id) => {
        const response = await api.delete(`/exams/${id}`);
        return unwrap(response);
    },
    publishExam: async (id) => {
        const response = await api.post(`/exams/${id}/publish`);
        return unwrap(response);
    },
    getAnalytics: async (id) => {
        const response = await api.get(`/exams/${id}/analytics`);
        return unwrap(response);
    },
    getPublishedExams: async () => {
        const response = await api.get('/exams/public');
        return unwrap(response) || [];
    },
    registerForExam: async (id, data) => {
        const response = await api.post(`/exams/${id}/register`, data);
        return unwrap(response);
    },
    checkRegistration: async (id) => {
        const response = await api.get(`/exams/${id}/registration-check`);
        return response?.data;
    },
    startExam: async (id) => {
        const response = await api.post(`/exams/${id}/start`);
        return response?.data;
    },
    publishResults: async (id) => {
        const response = await api.post(`/exams/${id}/publish-results`);
        return unwrap(response);
    },
    joinExam: async (examId) => {
        const response = await api.post('/exam/join', { examId });
        return unwrap(response);
    },
    // Questions related (nested under exam logic often)
    addQuestion: async (questionData) => {
        const response = await api.post('/questions', questionData);
        return unwrap(response);
    },
    getQuestions: async (examId) => {
        const response = await api.get(`/questions/exam/${examId}`);
        return unwrap(response);
    }
};

export default examService;
