import React, { useState, useEffect } from 'react';
import { getAllInterviews, getInterviewDetails, getInterviewWarnings } from '../services/api';

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

interface Question {
    text: string;
    techStack: string;
}

interface Answer {
    id: number;
    question: Question;
    candidateAnswer: string;
    aiFeedback: string;
    score: number;
}

interface WarningLog {
    id: number;
    reason: string;
    timestamp: string;
}

const AdminPage: React.FC = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [expandedInterviewId, setExpandedInterviewId] = useState<number | null>(null);
    const [detailsCache, setDetailsCache] = useState<Record<number, Answer[]>>({});
    const [warningsCache, setWarningsCache] = useState<Record<number, WarningLog[]>>({});
    const [loadingData, setLoadingData] = useState(false);

    // Mülakatları yükleme döngüsü
    useEffect(() => {
        loadInterviews();
    }, []);

    // Mülakatları yükleme fonksiyonu
    const loadInterviews = () => {
        getAllInterviews().then(data => setInterviews(data)).catch(err => console.error(err));
    };

    // Çıkış yapma fonksiyonu
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/admin-login';
    };
    
    // Mülakatları yükleme döngüsü
    useEffect(() => {
        getAllInterviews().then(data => setInterviews(data));
    }, []);

    const toggleRow = async (id: number) => {
        if (expandedInterviewId === id) {
            setExpandedInterviewId(null);
            return;
        }

        setExpandedInterviewId(id);

        // Veri daha önce çekilmediyse çek
        if (!detailsCache[id] || !warningsCache[id]) {
            try {
                setLoadingData(true);
                
                // İki isteği aynı anda at 
                const [answersData, warningsData] = await Promise.all([
                    getInterviewDetails(id),
                    getInterviewWarnings(id)
                ]);

                setDetailsCache(prev => ({ ...prev, [id]: answersData }));
                setWarningsCache(prev => ({ ...prev, [id]: warningsData }));
                
            } catch (error) {
                console.error("Veriler çekilemedi", error);
            } finally {
                setLoadingData(false);
            }
        }
    };

    // Durum badge fonksiyonu
    const getStatusBadge = (status: string) => {
    switch (status) {
        case 'COMPLETED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Tamamlandı</span>
        case 'TERMINATED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Atıldı</span>
        case 'ACTIVE': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">Devam Ediyor</span>
        case 'ABANDONED': return <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-bold border border-yellow-300">Terk Etti</span>;
        default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{status}</span>
    }
};

    // Zaman formatlama fonksiyonu
const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('tr-TR');
};


return (

    <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Paneli</h1>
                <div className="flex items-center gap-4">
                <button onClick={loadInterviews} className="bg-blue-600 text-white px-4 py-2 rounded-3xl rounded-hover:bg-blue-700">
                    Yenile
                </button>
                <button onClick={handleLogout} className="bg-blue-600 text-white px-4 py-2 rounded-3xl rounded-hover:bg-blue-700">
                    Çıkış Yap
                </button>
                </div>
            </div>
            

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mülakat ID</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aday</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Puan</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum & İşlem</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tarih</th>
                        </tr>
                    </thead>
                    <tbody>
                            {interviews.map((interview) => (
                                <React.Fragment key={interview.id}>
                                    <tr className={`hover:bg-gray-50 transition ${expandedInterviewId === interview.id ? 'bg-blue-50' : ''}`}>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm">{interview.id}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm font-medium">
                                            {interview.user.name} {interview.user.surname}
                                            <div className="text-gray-400 text-xs">{interview.user.email}</div>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                            {interview.score !== null ? (
                                                <span className={`font-bold ${interview.score >= 70 ? 'text-green-600' : interview.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {interview.score}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                            <div className="flex items-center">
                                                <div className="w-[110px] flex-shrink-0">
                                                    {getStatusBadge(interview.status)}
                                                </div>
                                                <button 
                                                    onClick={() => toggleRow(interview.id)}
                                                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded border border-gray-300 transition flex items-center gap-1 ml-6"
                                                >
                                                    🔍 İncele
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm text-gray-500">
                                            {new Date(interview.startTime).toLocaleDateString()}
                                        </td>
                                    </tr>

                                    {/* Açılır kapanır detay alanı */}
                                    {expandedInterviewId === interview.id && (
                                        <tr>
                                            <td colSpan={5} className="bg-gray-50 p-0 border-b border-gray-200">
                                                {loadingData && (!detailsCache[interview.id] || !warningsCache[interview.id]) ? (
                                                    <div className="p-8 text-center text-gray-500">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                        Veriler Yükleniyor...
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
                                                        
                                                        {/* Soru Cevap Analizi */}
                                                        <div className="flex-1 p-6">
                                                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                                📝 Soru & Cevap Analizi
                                                            </h3>
                                                            <div className="space-y-4">
                                                                {detailsCache[interview.id]?.length > 0 ? (
                                                                    detailsCache[interview.id].map((answer, index) => (
                                                                        <div key={answer.id} className="bg-white p-3 rounded border border-gray-200 text-sm shadow-sm">
                                                                            <div className="font-bold text-blue-800 mb-1">
                                                                                Soru {index + 1}: {answer.question.text}
                                                                            </div>
                                                                            <div className="bg-gray-50 p-2 rounded mb-2 text-gray-700 italic border border-gray-100">
                                                                                "{answer.candidateAnswer}"
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-gray-500">AI Yorumu: {answer.aiFeedback}</span>
                                                                                <span className={`font-bold px-2 py-0.5 rounded ${answer.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                                    {answer.score} Puan
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-gray-400 italic text-sm">Cevap kaydı bulunamadı.</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Uyarı kayıtları */}
                                                        <div className="w-full md:w-1/3 p-6 bg-red-50/30">
                                                            <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                                                                ⚠️ İhlal & Uyarı Kayıtları
                                                            </h3>
                                                            
                                                            {warningsCache[interview.id]?.length > 0 ? (
                                                                <ul className="space-y-3 relative border-l-2 border-red-200 ml-2 pl-4">
                                                                    {warningsCache[interview.id].map((log) => (
                                                                        <li key={log.id} className="relative">
                                                                            {/* Timeline */}
                                                                            <div className="absolute -left-[23px] top-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                                                            
                                                                            <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                                                                                <div className="text-xs text-gray-400 font-mono mb-1">
                                                                                    ⏰ {formatTime(log.timestamp)}
                                                                                </div>
                                                                                <div className="font-semibold text-gray-800 text-sm">
                                                                                    {log.reason}
                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center h-32 text-green-600 bg-green-50 rounded border border-green-100">
                                                                    <span className="text-2xl mb-2">🛡️</span>
                                                                    <span className="text-sm font-bold">Temiz Kayıt</span>
                                                                    <span className="text-xs">Hiçbir ihlal tespit edilmedi.</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                </table>
            </div>
        </div>
    </div>  
    );
};

export default AdminPage;