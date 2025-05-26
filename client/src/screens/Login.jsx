import React, { useState } from "react";
import logo from "../img/logo.png";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  console.log("hello from start front end");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  console.log("✅ Initial formData:", formData);

  const [errors, setErrors] = useState({});

    console.log("✅ Initial errors:", errors);

  const [showPassword, setShowPassword] = useState(false);
    console.log("✅ Initial showPassword:", showPassword);

  const [focusedFields, setFocusedFields] = useState({
    username: false,
    password: false,
  });
console.log("✅ Initial focusedFields:", focusedFields);
  
  const [loading, setLoading] = useState(false);

    console.log("✅ Initial loading:", loading);

  const [serverError, setServerError] = useState(null);
  console.log("✅ Initial serverError:", serverError);


const handleChange = (e) => {
  const { name, value } = e.target;
  console.log(`✏️ Field changed: ${name} = ${value}`); // 🔍 تتبع القيمة التي أدخلها المستخدم

  setFormData((prevData) => {
    const updatedData = { ...prevData, [name]: value };
    console.log("📦 Updated formData:", updatedData); // 🔍 تتبع بيانات formData بعد التحديث
    return updatedData;
  });
};

  const handleFocus = (field) => {
    setFocusedFields((prev) => {
      const updatedFocus = { ...prev, [field]: true };
      console.log("🟡 Focused Field:", updatedFocus);
      return updatedFocus;
    });
  };

    const handleBlur = (field) => {
    setFocusedFields((prev) => {
      const updatedFocus = { ...prev, [field]: formData[field] !== "" };
      console.log("🔵 Blurred Field:", updatedFocus);
      return updatedFocus;
    });
  };

const validate = () => {
  const newErrors = {};
  console.log("🔍 Validating formData:", formData);

  if (!formData.username.trim()) {
    newErrors.username = "يرجى إدخال اسم المستخدم";
    console.log("❌ username is empty");
  }

  if (!formData.password) {
    newErrors.password = "يرجى إدخال كلمة المرور";
    console.log("❌ password is empty");
  }

  console.log("✅ Validation result:", newErrors);
  return newErrors;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("🚀 Form submitted");

  const newErrors = validate(); // تم استبدال التحقق اليدوي بهذه الدالة الموحدة

  setErrors(newErrors);
  setServerError(null);

  if (Object.keys(newErrors).length === 0) {
    try {
      setLoading(true);
      console.log("📤 Sending formData to server:", formData);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("📨 Server responded:", res);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.log("❌ Server error:", errorData);
        throw new Error(errorData.error || "فشل تسجيل الدخول");
      }

      const data = await res.json();
      console.log("✅ Login success response:", data);

      if (data.success) {
        alert("تم تسجيل الدخول بنجاح!");
        // navigate("/dashboard");
        // localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setServerError(data.error || "بيانات الدخول غير صحيحة");
      }
    } catch (error) {
      console.error("❌ Network/server error:", error);
      setServerError(error.message || "حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center w-full max-w-md px-6 text-right">
        {/* اللوجو */}
        <div className="flex justify-start w-full mb-8">
          <img src={logo} alt="Logo" className="w-24 h-auto" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full text-right">
          {/* اسم المستخدم */}
          <div className="relative">
            <label
              className={`absolute right-3 transition-all duration-200 ${
                focusedFields.username || formData.username
                  ? "top-[-8px] text-sm text-gray-600 bg-white px-1"
                  : "top-1/2 transform -translate-y-1/2 text-gray-400"
              }`}
            >
              اسم المستخدم
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => handleFocus("username")}
              onBlur={() => handleBlur("username")}
              className={`border ${
                focusedFields.username
                  ? "border-blue-500"
                  : "border-gray-300"
              } rounded-lg px-4 py-3 w-full text-md focus:outline-none text-right`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* كلمة المرور */}
          <div className="relative">
            <label
              className={`absolute right-3 transition-all duration-200 ${
                focusedFields.password || formData.password
                  ? "top-[-8px] text-sm text-gray-600 bg-white px-1"
                  : "top-1/2 transform -translate-y-1/2 text-gray-400"
              }`}
            >
              كلمة المرور
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password")}
              className={`border ${
                focusedFields.password
                  ? "border-blue-500"
                  : "border-gray-300"
              } rounded-lg px-4 py-3 w-full text-md focus:outline-none text-right pr-10`}
            />
            <div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* رسائل الخطأ من السيرفر */}
          {serverError && (
            <div className="text-center p-3 bg-red-100 text-red-700 rounded-lg">
              {serverError}
            </div>
          )}

          {/* رابط نسيت كلمة المرور */}
          <div className="text-center">
            <a href="#" className="text-blue-600 text-sm hover:underline">
              <strong>نسيت كلمة المرور؟</strong>
            </a>
          </div>

          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white text-md py-3 rounded-lg mt-4 font-medium ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "جاري المعالجة..." : "تسجيل دخول"}
          </button>

          {/* رابط إنشاء حساب */}
          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">ليس لديك حساب؟ </span>
            <a
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              إنشاء حساب
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}