import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AdminLoginPage: React.FC = () => {
    const Navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { username, password });
            
            // Token'ı kaydet
            const token = response.data.token;
            localStorage.setItem('token', token);
            
            Navigate('/admin');
        } catch (err) {
            setError("Giriş başarısız!");
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Girişi</h2>
                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Kullanıcı Adı" 
                        className="w-full p-2 border rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Şifre" 
                        className="w-full p-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Giriş Yap
                    </button>
                </form>
                <button onClick={() => Navigate('/')} className="w-full mt-2 text-gray-500 text-sm hover:underline">
                    ← Ana Sayfaya Dön
                </button>
            </div>
        </div>
    );
};

export default AdminLoginPage;