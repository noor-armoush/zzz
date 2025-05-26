import React, { useState } from "react";
import logo from "../img/logo.png";
import { Eye, EyeOff } from "lucide-react";

const regionToId = {
  الضفة: 1,
  القدس: 2,
  الداخل: 3,
};

export default function Signup() {
  console.log("hello from front end ");
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
    region: "",
    city: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const regionCities = {
    الضفة: [
      "الخليل",
      "نابلس",
      "طولكرم",
      "يطا",
      "جنين",
      "رام الله",
      "البيرة",
      "دورا",
      "الظاهريه",
      "قلقيليه",
      "بيت لحم",
      "اريحا",
      "طوباس",
      "سلفيت",
      "بيت جالا",
      "بيت ساحور",
    ],
    القدس: ["القدس الشرقية", "العيزرية", "أبو ديس", "الرام"],
    الداخل: [
      "الطيبة",
      "اللد",
      "الرملة",
      "الناصرة",
      "عكا",
      "يافا",
      "حيفا",
      "راهط",
      "باقة الغربية",
      "سخنين",
      "شفا عمرو",
      "أم الفحم",
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => password.length >= 6;

  const validatePhone = (phone) => /^05\d{8}$/.test(phone);

  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "يرجى إدخال اسم المستخدم";
    }

    if (!formData.password) {
      newErrors.password = "يرجى إدخال كلمة المرور";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";
    }

    if (!formData.email) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "البريد الإلكتروني يجب أن ينتهي بـ @gmail.com";
    }

    if (!formData.phone) {
      newErrors.phone = "يرجى إدخال رقم الجوال";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    }

    if (!formData.region) {
      newErrors.region = "يرجى اختيار المنطقة";
    }

    if (!formData.city) {
      newErrors.city = "يرجى اختيار المدينة";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            phone: formData.phone,
            address: formData.city, // أو إنشاء حقل عنوان منفصل
            email: formData.email,
            region_id: regionToId[formData.region],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "حدث خطأ أثناء التسجيل");
          return;
        }

        alert("تم التسجيل بنجاح!");
        console.log("تم إنشاء المستخدم:", data.user);

        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          phone: "",
          email: "",
          region: "",
          city: "",
        });
        setErrors({});
      } catch (error) {
        console.error("خطأ في إرسال البيانات:", error);
        alert("حدث خطأ أثناء الاتصال بالخادم");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center w-full max-w-md px-6 text-right">
        <div className="flex justify-start w-full max-w-md mb-4">
          <img src={logo} alt="Logo" className="w-24 h-auto" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 w-full text-right">
          <div className="relative">
            {formData.username && (
              <label className="absolute -top-3 right-3 text-xs text-gray-600 bg-white px-1">
                اسم المستخدم
              </label>
            )}
            <input
              type="text"
              name="username"
              placeholder="اسم المستخدم"
              value={formData.username}
              onChange={handleChange}
              className="border border-gray-400 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:border-sky-500 text-right"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div className="relative">
            {formData.password && (
              <label className="absolute -top-3 right-3 text-xs text-gray-600 bg-white px-1">
                كلمة المرور
              </label>
            )}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              className="border border-gray-400 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:border-sky-500 text-right"
            />
            <div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="relative">
            {formData.confirmPassword && (
              <label className="absolute -top-3 right-3 text-xs text-gray-600 bg-white px-1">
                تأكيد كلمة المرور
              </label>
            )}
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="تأكيد كلمة المرور"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="border border-gray-400 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:border-sky-500 text-right"
            />
            <div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="relative">
            {formData.email && (
              <label className="absolute -top-3 right-3 text-xs text-gray-600 bg-white px-1">
                البريد الإلكتروني
              </label>
            )}
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-400 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:border-sky-500 text-right"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="relative">
            {formData.phone && (
              <label className="absolute -top-3 right-3 text-xs text-gray-600 bg-white px-1">
                رقم الهاتف
              </label>
            )}
            <input
              type="tel"
              name="phone"
              placeholder="رقم الجوال"
              value={formData.phone}
              onChange={handleChange}
              className="border border-gray-400 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:border-sky-500 text-right"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="relative w-full" dir="rtl">
            {formData.region && (
              <label className="absolute -top-3 right-3 text-xs text-gray-600 bg-white px-1">
                المنطقة
              </label>
            )}
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="appearance-none border border-gray-400 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:border-sky-500 bg-white placeholder-gray-400 text-right"
              style={{ direction: "rtl" }}
            >
              <option value="">اختر المنطقة</option>
              <option value="الضفة">الضفة</option>
              <option value="القدس">القدس</option>
              <option value="الداخل">الداخل</option>
            </select>
            <div className="pointer-events-none absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              ▼
            </div>
            {errors.region && (
              <p className="text-red-500 text-xs mt-1">{errors.region}</p>
            )}
          </div>

          <div className="relative">
            {formData.city && (
              <label className="absolute -top-3 right-3 text-xs text-gray-600 bg-white px-1">
                المدينة
              </label>
            )}
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.region}
              className="appearance-none border border-gray-400 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:border-sky-500 bg-white placeholder-gray-400 text-right"
              style={{ direction: "rtl" }}
            >
              <option value="">
                {formData.region ? "اختر المدينة" : "اختر المدينة "}
              </option>
              {(regionCities[formData.region] || []).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              ▼
            </div>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-md py-3 rounded-lg mt-4 font-medium"
          >
            إنشاء حساب
          </button>
        </form>
      </div>
    </div>
  );
}
