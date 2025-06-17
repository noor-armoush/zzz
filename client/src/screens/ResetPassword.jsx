import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../img/logo.png";
import axios from "axios";

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const { email } = location.state || {};

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            return setError("يرجى ملء كلا الحقلين");
        }

        if (password !== confirmPassword) {
            return setError("كلمتا المرور غير متطابقتين");
        }

        try {
            const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
                email: email, 
                newPassword: password,
            });

            if (response.data.success) {
                setSuccessMessage("تم تغيير كلمة المرور بنجاح، سيتم تحويلك لتسجيل الدخول");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError("حدث خطأ أثناء التحديث");
            }
        } catch (err) {
            setError("خطأ في الاتصال بالخادم");
        }
    };

    if (!email) { 
        navigate("/login");
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="border-2 border-blue-500 rounded-xl p-10 w-[95%] max-w-lg shadow-md text-center">
                {/* الشعار والعنوان */}
                <div className="flex items-center justify-center mb-6 gap-3">
                    <img src={logo} alt="شعار كناري" className="w-16 h-16" />
                    <h2 className="text-2xl font-bold text-gray-800">كناري لطيور الزينة</h2>
                </div>

                {/* العنوان الفرعي */}
                <div className="text-sm text-gray-700 mb-6">
                  {email} {/* عرض البريد الإلكتروني للمستخدم */}  أدخل كلمة المرور الجديدة لحسابك
                </div>

                {/* حقول كلمة المرور */}
                <input
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg text-center mb-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="password"
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg text-center mb-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                {/* رسالة خطأ أو نجاح */}
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {successMessage && <p className="text-green-600 text-sm mb-4">{successMessage}</p>}

                {/* الأزرار */}
                <div className="flex justify-between gap-4">
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-blue-100 text-gray-800 py-2 rounded-md border hover:bg-blue-200"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full bg-sky-400 text-white py-2 rounded-md hover:bg-sky-500"
                    >
                        إعادة التعيين
                    </button>
                </div>
            </div>
        </div>
    );
}