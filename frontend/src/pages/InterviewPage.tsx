import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';

const InterviewPage: React.FC = () => {
    const { id } = useParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }
            catch (err) {
                console.error('Kamera başlatma hatası:', err);
                setError('Kameraya erişilemedi. Lütfen tarayıcınızın izinlerini kontrol ediniz.');
            }
        };

        startCamera();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);
    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
            <div className="w-full max-w-4xl flex justify-between items-center mb-6 p-4 bg-gray-800 rounded-lg">
                <h1 className="text-xl font-bold">Mülakat ID: {id}</h1>
                <div className="text-yellow-400 font-mono">Uyarılar: 0/3</div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
                <div className="flex-1 flex flex-col items-center">
                    <div className="relative border-4 border-blue-500 rounded-lg overflow-hidden shadow-2xl bg-black w-[640px] h-[480px]">
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold bg-black z-20">{error}</div> 
                        )}
                        <video 
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-xs font-bold animate-pulse">
                            REC
                        </div>
                    </div>
                    <p className="mt-2 text-gray-400 text-sm">Yüzünüzü karenin içinde tutun.</p>
                </div>
                <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
                    <h2 className="text-lg font-semibold text-blue-300 mb-2">Soru 1: </h2>
                    <p className="text-xl mb-6">Kendinizi ve teknik geçmişinizi kısaca anlatır mısınız?</p>

                    <textarea 
                    className="w-full flex-1 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white focus:ring-blue-500 focus:outline-none resize-none"
                    placeholder="Cevabınızı giriniz..."
                    />
                    <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"> Gönder </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewPage;