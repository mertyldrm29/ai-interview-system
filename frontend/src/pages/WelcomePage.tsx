import React, { useState } from 'react';
import { startInterview } from '../services/api';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
    const Navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // telefon numarası kontrolü
        if (name === 'phone') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            if (onlyNums.length <= 10) {
                setFormData({ ...formData, [name]: onlyNums});
            }        
        } else {
            setFormData({ ...formData, [name]: value});
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.phone.length !== 10) {
            alert("Telefon numarası 10 haneli olmalıdır.");
            return;
        }

        try {
            const data = await startInterview(formData);
            console.log('Mülakat başlatıldı:', data);
           // alert("Mülakat oluşturuldu. ID: " + data.id);
            Navigate(`/interview/${data.id}`);
    } catch (error) {
        console.error("Hata:", error);
        alert("Mülakat başlatılamadı, backend'de sorun olabilir.");
    }
};

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-slate-500 p-8 rounded-xl shadow-lg w-full max-w-md"> 
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Teknik Mülakat Girişi</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adınız</label>
                    <input 
                    name="name"
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Adınızı giriniz"
                    required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soyadınız</label>
                    <input 
                    name="surname"
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Soy adınızı giriniz"
                    required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mail Adresiniz</label>
                    <input 
                    name="email"
                    type="email"
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Mail adresinizi giriniz"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numaranız</label>
                    <input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Telefon numaranızı başında 0 olmadan giriniz"
                    required
                    />
                </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                Mülakata Başla
            </button>
        </form>
    </div>
</div>
);
};

export default WelcomePage;



