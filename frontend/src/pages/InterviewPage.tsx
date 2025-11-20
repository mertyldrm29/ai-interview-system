import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaceDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';
import { sendWarning } from '../services/api';

const InterviewPage: React.FC = () => {
    const { id } = useParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const startTimeRef = useRef<number>(Date.now()); // Sayfa açılış zamanı
    const Navigate = useNavigate();
    
    // State'ler
    const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
    const [faceCount, setFaceCount] = useState<number>(0); // Anlık yüz sayısı
    const [warningMsg, setWarningMsg] = useState<string | null>(null); // Ekranda görünecek uyarı
    const [isModelLoaded, setIsModelLoaded] = useState(false); // Model yüklendi mi
    const [warningCount, setWarningCount] = useState<number>(0);
    const lastWarningTime = useRef<number>(0); // Son uyarının zamanı (Timestamp)

    // MediaPipe Modelini Yükle
    useEffect(() => {
        const loadModel = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                const detector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
                        delegate: "GPU" 
                    },
                    runningMode: "VIDEO"
                });

                setFaceDetector(detector);
                setIsModelLoaded(true);
                console.log("Yapay Zeka Modeli Yüklendi!");
            } catch (err) {
                console.error("Model yüklenemedi:", err);
            }
        };

        loadModel();
    }, []);

    // Kamerayı Başlat
    useEffect(() => {
        let isMounted = true; // Sayfa açık mı kontrolü

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                });
                
                // kamera açılana kadar sayfa kapandıysa geri kapat
                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = stream; 

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Kamera hatası:", err);
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            stopCamera(); 
        };
    }, []);

    // Tespit için döngü
    useEffect(() => {
        let animationId: number;
        
        // Mülakat başladığında zamanlayıcıyı resetle
        startTimeRef.current = Date.now();

        const detectLoop = () => {
            if (faceDetector && videoRef.current && videoRef.current.readyState === 4) {
                // O anki video karesini analiz et
                const startTimeMs = performance.now();
                const detections = faceDetector.detectForVideo(videoRef.current, startTimeMs).detections;

                const count = detections.length;
                setFaceCount(count);

                // --- Warmup Kontrol ---
                // Sayfa açılalı 5 saniye geçmediyse ihlalleri yok say.
                const timeElapsed = Date.now() - startTimeRef.current;
                const isWarmingUp = timeElapsed < 5000;

                // --- İHLAL KONTROLLERİ ---
                let currentReason = null;

                if (!isWarmingUp) { // ısınma süresi bittiyse kontrol et
                    if (count === 0) {
                        currentReason = "Yüz tespit edilemedi";
                        setWarningMsg("⚠️ YÜZ BULUNAMADI! Lütfen kameraya bakın.");
                    } else if (count > 1) {
                        currentReason = "Birden fazla kişi tespit edildi";
                        setWarningMsg("⚠️ İHLAL: Ekranda birden fazla kişi var!");
                    } else {
                        setWarningMsg(null);
                    }
                } else {
                    setWarningMsg("🔵 Sistem Hazırlanıyor..."); 
                }

                // bir ihlal varsa ve son uyarının üzerinden 5 saniye geçtiyse
                if (currentReason && id) {
                    const now = Date.now();
                    
                    // Cooldown kontrolü (5 saniye)
                    if (now - lastWarningTime.current > 5000) {
                        lastWarningTime.current = now; 
                        
                        console.log("Backend'e uyarı gönderiliyor: ", currentReason);

                        // Backend isteği
                        sendWarning(id, currentReason)
                            .then((updatedInterview) => {
                                console.log("Uyarı kaydedildi.");
                                
                                // Sayaç artırma
                                setWarningCount(prev => prev + 1);

                                if (updatedInterview.status === 'TERMINATED') {
                                    stopCamera(); 
                                    setTimeout(() => {
                                        alert("Çok fazla ihlal yaptınız. Mülakat sonlandırıldı!");
                                        Navigate('/');
                                    }, 100);
                                }
                            })
                            .catch(err => {
                                console.error("Uyarı gönderilemedi:", err);
                            });
                    }
                }
            }
            
            animationId = requestAnimationFrame(detectLoop);
        };

        if (isModelLoaded) {
            detectLoop();
        }

        return () => cancelAnimationFrame(animationId);
    }, [faceDetector, isModelLoaded, id, startTimeRef]);

    const stopCamera = () => {
        // 1. Stream'i durdur
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        // 2. Video elementini boşalt 
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    return (
        <div className={`min-h-screen flex flex-col items-center p-4 transition-colors duration-500 ${warningMsg ? 'bg-red-900' : 'bg-gray-900'}`}>
            
            {/* Üst Bilgi */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-6 p-4 bg-gray-800 rounded-lg shadow-lg text-white">
                <h1 className="text-xl font-bold">Mülakat ID: {id}</h1>
                <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded font-mono font-bold ${faceCount === 1 ? 'bg-green-600' : 'bg-red-600'}`}>
                        Yüz Sayısı: {faceCount}
                    </div>
                    <div className="text-yellow-400 font-mono">Uyarılar: {warningCount}/3</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
                {/* Kamera ve AI Durumu */}
                <div className="flex-1 flex flex-col items-center relative">
                    {/* Video Çerçevesi */}
                    <div className={`relative rounded-lg overflow-hidden shadow-2xl bg-black w-[640px] h-[480px] border-4 ${warningMsg ? 'border-red-600 animate-pulse' : 'border-blue-500'}`}>
                        
                        {!isModelLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black z-20 text-white">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-3"></div>
                                AI Modeli Yükleniyor...
                            </div>
                        )}

                        {warningMsg && (
                            <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-center py-2 font-bold z-10 opacity-90">
                                {warningMsg}
                            </div>
                        )}

                        <video 
                            ref={videoRef}
                            autoPlay 
                            muted 
                            playsInline
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                    </div>
                    <p className="mt-3 text-gray-400 text-sm">
                        {isModelLoaded ? "🟢 Yapay Zeka Aktif ve İzliyor" : "⚪ Sistem hazırlanıyor..."}
                    </p>
                </div>

                {/* Soru Alanı */}
                <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col text-white">
                    <h2 className="text-lg font-semibold text-blue-300 mb-2">Soru 1:</h2>
                    <p className="text-xl mb-6">Spring Boot'ta Dependency Injection nedir?</p>
                    <textarea 
                        className="w-full flex-1 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        placeholder="Cevabınızı buraya yazın..."
                    />
                    <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">
                        Cevabı Gönder
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewPage;