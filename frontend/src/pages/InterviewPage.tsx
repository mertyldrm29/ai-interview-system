import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaceDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';
import { getNextQuestion, sendWarning, submitAnswer, finishInterview } from '../services/api';

interface Question {
    id: number;
    text: string;
    techStack: string;
}

const InterviewPage: React.FC = () => {
    const { id } = useParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const startTimeRef = useRef<number>(Date.now()); // Sayfa açılış zamanı
    const Navigate = useNavigate();
    const lastWarningTime = useRef<number>(0); // Son uyarının zamanı (Timestamp)
    const tabIntervalRef = useRef<number | null>(null); // Sekme kontrol döngüsü

    // AI ve Kamera State'leri
    const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
    const [faceCount, setFaceCount] = useState<number>(0); // Anlık yüz sayısı
    const [warningMsg, setWarningMsg] = useState<string | null>(null); // Ekranda görünecek uyarı
    const [isModelLoaded, setIsModelLoaded] = useState(false); // Model yüklendi mi
    const [warningCount, setWarningCount] = useState<number>(0);

    // Soru Cevap State'leri
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [answerText, setAnswerText] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

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
        if (isFinished) return;

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
    }, [isFinished]);

    // Tespit için döngü
    useEffect(() => {
        if(isFinished) return;

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

                if (!isWarmingUp) {
                    if (count === 0) {
                        triggerViolation("Yüz tespit edilemedi");
                    } else if (count > 1) {
                        triggerViolation("Birden fazla kişi tespit edildi");
                    } else {
                        if (Date.now() - lastWarningTime.current > 5000) {
                             setWarningMsg(null);
                        }
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

    // Kamera durdurma fonksiyonu
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
         
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Soru yükleme fonksiyonu
    const loadNextQuestion = async () => {
        if (!id) return;
        try{
            setIsSubmitting(true);
            const question = await getNextQuestion(id);

            if (question) {
                setCurrentQuestion(question);
                setAnswerText("");
            } else {
                if (!isFinished) {
                    await finishInterview(id);
                    setIsFinished(true);
                    stopCamera();
                }
            } 
        } catch (error) {
            console.error("Soru çekilemedi:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Soru yükleme döngüsü
    useEffect(() => {
        loadNextQuestion();
    }, [id]);
    
    const handleAnswerSubmit = async () => {
        if(!id || !currentQuestion || !answerText.trim()) return;

        try {
            setIsSubmitting(true);
            await submitAnswer(id, currentQuestion.id, answerText);

            await loadNextQuestion();
        } catch (error) {
            console.error("Cevap gönderilemedi:", error);
            alert("Bir hata oluştu, lütfen tekrar deneyin.");
            setIsSubmitting(false);
        }
    };

    // İhlal tetikleme fonksiyonu
    const triggerViolation = (reason: string) => {
        if (!id || isFinished) return;

        const now = Date.now();

        if (now - lastWarningTime.current > 5000) {
            lastWarningTime.current = now; 
            
            console.log("⚠️ İHLAL TESPİT EDİLDİ:", reason);
            setWarningMsg(`⚠️ İHLAL: ${reason}`); 

            // Backend'e bildir
            sendWarning(id, reason)
                .then((updatedInterview) => {
                    setWarningCount(prev => prev + 1);

                    if (updatedInterview.status === 'TERMINATED') {
                        stopCamera();
                        // Kullanıcıya bilgi ver
                        setTimeout(() => {
                            alert("Mülakat İhlali: " + reason + "\n\nÇok fazla uyarı aldığınız için mülakat sonlandırıldı.");
                            Navigate('/');
                        }, 100);
                    }
                })
                .catch(err => console.error("Uyarı gönderilemedi:", err));
        }
    };

    // Sekme kontrol döngüsü
    useEffect(() => {
        // İhlal Sayacı Başlatma Fonksiyonu
        const startViolationLoop = (reason: string) => {

            triggerViolation(reason);

            if (!tabIntervalRef.current) {
                tabIntervalRef.current = window.setInterval(() => {
                    // Kullanıcı hala dönmediyse sürekli ceza kes
                    // (document.hidden kontrolü sekme için, !document.hasFocus() uygulama için)
                    if (document.hidden || !document.hasFocus()) {
                        triggerViolation(reason + " (Sürekli İhlal)");
                    }
                }, 1000);
            }
        };

        // İhlal Bitiş Fonksiyonu
        const stopViolationLoop = () => {
            if (tabIntervalRef.current) {
                clearInterval(tabIntervalRef.current);
                tabIntervalRef.current = null;
            }
        };

        // 1. Durum: Sekme Değişikliği
        const handleVisibilityChange = () => {
            if (document.hidden) {
                startViolationLoop("Sekme Değişikliği");
            } else {

            }
        };

        // 2. Durum: Uygulama Değişikliği 
        const handleBlur = () => {
            // Sadece mülakat bitmediyse çalışsın
            startViolationLoop("Ekran Odağı Kaybı / Başka Uygulama");
        };

        // 3. Durum Geri Dönüş (Window Focus)
        const handleFocus = () => {
            stopViolationLoop();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
            if (tabIntervalRef.current) clearInterval(tabIntervalRef.current);
        };
    }, [id, isFinished]);

    if (isFinished) {
        return(
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-3xl font-bold mb-4">Mülakat Tamamlandı!</h1>
                    <p className="text-gray-300 mb-8">
                        Katılımınız için teşekkür ederiz. Cevaplarınız yapay zeka tarafından
                         değerlendirilip sonuçları yöneticiye iletildi.
                    </p>
                    <button
                    onClick={() => Navigate('/')} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">Ana Sayfaya Dön</button>
                </div>
            </div>
        );
    }

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

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl flex-grow">
                {/* Kamera ve AI Durumu */}
                <div className="flex-1 flex flex-col items-center relative">
                    {/* Video Çerçevesi */}
                    <div className={`relative rounded-lg overflow-hidden shadow-2xl bg-black w-full aspect-video border-4 ${warningMsg ? 'border-red-600 animate-pulse' : 'border-blue-500'}`}>
                        
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
                <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col text-white h-[480px]">
                    {currentQuestion ? (
                        <>
                    <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-blue-300">Soru #{currentQuestion.id}</h2>
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">{currentQuestion.techStack}</span>
                    </div>
                    <p className="text-xl mb-6 flex-grow overflow-y-auto">{currentQuestion.text}</p>
                    <textarea 
                        className="w-full h-40 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none mb-4"                        placeholder="Cevabınızı buraya yazın..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <button 
                    onClick={handleAnswerSubmit}
                    disabled={isSubmitting || !answerText.trim()}
                    className={`w-full font-bold py-3 px-6 rounded-lg transition flex items-center justify-center
                        ${isSubmitting || !answerText.trim() 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        AI Değerlendiriyor...
                                    </>
                                ) : "Cevabı Gönder"}
                    </button>
                </>
            ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Soru yükleniyor...
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default InterviewPage;