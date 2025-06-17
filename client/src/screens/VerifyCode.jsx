import React, { useEffect , useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../img/logo.png";
import axios from "axios"; 

export default function VerifyCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, maskedEmail } = location.state || {};

  const [inputEmail, setInputEmail] = useState(""); 
  const [error, setError] = useState(""); 
  const [attemptCount, setAttemptCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username || !maskedEmail) {
      navigate("/login");
    }
  }, [username, maskedEmail, navigate]);

  if (!username || !maskedEmail) {
    return null;
  }

  const handleNext = async () => {
    if (!inputEmail || inputEmail.trim() === "") {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setLoading(true); 

    try {
      const response = await axios.post("http://localhost:5000/api/auth/send-code", {
        username,
        email: inputEmail,
      });

      if (response.data.success) {
        navigate("/verify-code2", {
          state: {
            username,
            email: inputEmail,
          },
        });
      } else {
        const newCount = attemptCount + 1;
        setAttemptCount(newCount);

        if (newCount >= 5) {
          setError("لقد تجاوزت عدد المحاولات المسموح بها");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError("البريد الإلكتروني غير مطابق للمسجل");
        }
      }
    } catch (err) {
      console.error("خطأ في الطلب:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("حدث خطأ أثناء إرسال الرمز. حاول مرة أخرى");
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="border-2 border-blue-500 rounded-xl p-10 w-[95%] max-w-lg shadow-md text-center">
        {/* الشعار والعنوان */}
        <div className="flex items-center justify-center mb-6 gap-3">
          <img src={logo} alt="شعار كناري" className="w-16 h-16" />
          <h2 className="text-2xl font-bold text-gray-800">
            كناري لطيور الزينة
          </h2>
        </div>

        {/* الجملة: الكلام على اليمين، والإيميل على اليسار */}
        <div className="text-sm text-gray-700 mb-6 flex justify-center items-center flex-wrap gap-1 rtl">
          <span className="font-mono text-blue-600 ltr">{maskedEmail}</span>
          <span>سيتم إرسال رمز إليك عبر البريد الإلكتروني</span>
        </div>

        {/* مربع إدخال البريد الإلكتروني */}
        <input
          type="email"
          placeholder="أدخل البريد الإلكتروني"
          value={inputEmail} 
          onChange={(e) => setInputEmail(e.target.value)} 
          className="w-full px-4 py-2 border rounded-lg text-center bg-white text-black mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-text"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* الأزرار */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-100 text-gray-800 py-2 rounded-md border hover:bg-blue-200"
            disabled={loading} 
          >
            إلغاء
          </button>

          <button
            onClick={handleNext}
            className="w-full bg-sky-400 text-white py-2 rounded-md hover:bg-sky-500 flex items-center justify-center gap-2"
            disabled={loading} 
          >
            {loading && ( 
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            )}
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
