import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../img/logo.png";
import axios from "axios";

export default function VerifyCodeStep2() {
  const location = useLocation();
  const navigate = useNavigate();

  const { username, email } = location.state || {};

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false); //  حالة  لتتبع انتهاء صلاحية الرمز

  useEffect(() => {
    if (!username || !email) {
      navigate("/login");
    }
  }, [username, email, navigate]);

  if (!username || !email) return null;

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-code", {
        username,
        code,
        email,
      });

      if (response.data.success) {
        navigate("/reset-password", { state: { username, email } });
      } else {
        setError("الرمز غير صحيح، حاول مرة أخرى.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        const msg = err.response.data.message;

        if (msg.includes("انتهت صلاحية الرمز")) {
          setExpired(true); //  تم انتهاء الصلاحية
          setError("انتهت صلاحية الرمز. الرجاء طلب رمز جديد."); 
        } else {
          setError(msg); //  عرض رسالة الخطأ القادمة من الباك
        }
      } else {
        setError("حدث خطأ أثناء التحقق. حاول مرة أخرى.");
      }
    }
  };

  const handleRequestNewCode = () => {
    navigate("/verify-code", { state: { username, maskedEmail: maskEmail(email) } }); //  إعادة التوجيه لإعادة إدخال البريد
  };

  const maskEmail = (email) => {
    const [local, domain] = email.split("@");
    const visible = local.slice(0, 2);
    return `${visible}***@${domain}`;
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
          أدخل الرمز الذي وصل إليك عبر البريد الإلكتروني<br />
          <span className="font-mono text-black">{email}</span>
        </p>

        {/* إدخال الرمز */}
        {!expired && ( //  إخفاء الإدخال إذا انتهت صلاحية الرمز
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="أدخل الرمز"
            className="w-full px-4 py-2 border rounded-lg text-center bg-white text-black mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}

        {/* رسالة الخطأ */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* الأزرار */}
        <div className="flex flex-col gap-4">
          {!expired ? (
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
          ) : (
            <button
              onClick={handleRequestNewCode} //  زر طلب رمز جديد
              className="w-full bg-yellow-400 text-white py-2 rounded-md hover:bg-yellow-500"
            >
              طلب رمز جديد
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
