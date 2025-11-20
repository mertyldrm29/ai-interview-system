import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Mülakat başlatma fonksiyonu
export const startInterview = async (userData: { name: string, surname: string, email: string, phone: string }) => {
    const response = await api.post('/interviews/start', userData);
    return response.data;
};

export const sendWarning = async (interviewId: string, reason: string) => {
    const response = await api.post(`/interviews/${interviewId}/warn`, reason, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
};