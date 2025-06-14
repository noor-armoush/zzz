import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../img/logo.png";
import axios from "axios";

export default function VerifyCodeStep2() {
  const location = useLocation();
  const navigate = useNavigate();

  // استقبال البيانات المرسلة من الصفحة السابقة
  const { username, email } = location.state || {};

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username || !email) {
      navigate("/login"); // إذا لم تكن البيانات موجودة، نرجع المستخدم
    }
  }, [username, email, navigate]);

  if (!username || !email) return null;

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-code-step2", {
        username,
        code,
        email, // إرسال البريد الإلكتروني أيضًا إذا احتجته في الباك إند
      });

      if (response.data.success) {
        // الانتقال للخطوة التالية أو صفحة النجاح
        navigate("/reset-password", { state: { username, email } });
      } else {
        setError("الرمز غير صحيح، حاول مرة أخرى.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء التحقق. حاول مرة أخرى.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="border-2 border-blue-500 rounded-xl p-10 w-[95%] max-w-lg shadow-md text-center">

        {/* الشعار والعنوان */}
        <div className="flex items-center justify-center mb-6 gap-3">
          <img src={logo} alt="شعار كناري" className="w-16 h-16" />
          <h2 className="text-2xl font-bold text-gray-800">كناري لطيور الزينة</h2>
        </div>

        {/* الجملة التي تظهر البريد الإلكتروني */}
        <p className="text-sm text-gray-700 mb-6">
          ادخل الرمز الذي وصل إليك عبر البريد الالكتروني<br />
          <span className="font-mono text-black">{email}</span>
        </p>

        {/* إدخال الرمز */}
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="أدخل الرمز"
          className="w-full px-4 py-2 border rounded-lg text-center bg-white text-black mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* الأزرار */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-100 text-gray-800 py-2 rounded-md border hover:bg-blue-200"
          >
            إلغاء
          </button>
          <button
            onClick={handleVerifyCode}
            className="w-full bg-sky-400 text-white py-2 rounded-md hover:bg-sky-500"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
