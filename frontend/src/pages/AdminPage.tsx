import React, { useState, useEffect } from 'react';
import { getAllInterviews } from '../services/api';

interface User {
    name: string;
    surname: string;
    email: string;
}

interface Interview {
    id: number;
    user: User;
    score: number | null;
    status: string;
    startTime: string;  
}

const AdminPage: React.FC = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);

    useEffect(() => {
        getAllInterviews().then(data => setInterviews(data));
    }, []);

    const getStatusBadge = (status: string) => {
    switch (status) {
        case 'COMPLETED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Tamamlandı</span>
        case 'TERMINATED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Atıldı</span>
        case 'ACTIVE': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">Devam Ediyor</span>
        default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{status}</span>
    }
};

return (

    <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Paneli</h1>
                <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-hover:bg-blue-700">
                    Yenile
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mülakat ID</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aday</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">E-Posta</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tarih</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Puan</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {interviews.map((interview) => (
                            <tr key={interview.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{interview.id}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-medium">{interview.user.name} {interview.user.surname}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-gray-500">{interview.user.email}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-gray-500">{new Date(interview.startTime).toLocaleDateString()} {new Date(interview.startTime).toLocaleTimeString()}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{interview.score !== null ? (
                                    <span className={`font-bold ${interview.score >= 70 ? 'text-green-600' : interview.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}> {interview.score} </span>
                                ) : '-'}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {getStatusBadge(interview.status)}
                                </td>
                            </tr>
                        ))}
                        {interviews.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-500">Henüz mülakat yapılmadı.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>  
    );
};

export default AdminPage;