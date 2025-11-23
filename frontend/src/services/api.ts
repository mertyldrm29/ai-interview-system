import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// API endpointleri
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Mülakat başlatma fonksiyonu
export const startInterview = async (userData: { name: string, surname: string, email: string, phone: string }) => {
    const response = await api.post('/interviews/start', userData);
    return response.data;
};

// Uyarı gönderme fonksiyonu
export const sendWarning = async (interviewId: string, reason: string) => {
    const response = await api.post(`/interviews/${interviewId}/warn`, reason, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
};

// Soru getirme fonksiyonu
export const getNextQuestion = async (interviewId: string) => {
    const response = await api.get(`/interviews/${interviewId}/question`);

    return response.data || null;
};

// Cevap gönderme fonksiyonu
export const submitAnswer = async (interviewId: string, questionId: number, answerText: string) => {
    const response = await api.post(`/interviews/${interviewId}/answer`, answerText, {
        params: { questionId },
        headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
}

// Mülakatı tamamla ve mail gönderme fonksiyonu
export const finishInterview = async (interviewId: string) => {
    await api.post(`/interviews/${interviewId}/finish`);
};

// Tüm mülakatları getirme fonksiyonu
export const getAllInterviews = async () => {
    const response = await api.get('/admin/interviews');
    return response.data;
};