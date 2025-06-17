// controllers/authController.js

const bcrypt = require("bcrypt");
const pool = require("../config/db");
const nodemailer = require("nodemailer");

// تسجيل الدخول
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "يجب إدخال اسم المستخدم وكلمة المرور",
    });
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      error: "نوع البيانات غير صحيح",
    });
  }

  try {
    const result = await pool.query(
      `SELECT user_id, user_name, password FROM users 
       WHERE user_name = $1 OR user_email = $1`,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود على قاعدة البيانات",
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    }

    const { password: _, ...userData } = user;

    return res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: userData,
    });
  } catch (err) {
    console.error("🔥 خطأ في الخادم:", err);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ في الخادم",
    });
  }
};

// إنشاء حساب جديد
const signupUser = async (req, res) => {
  const {
    username,
    password,
    phone,
    email,
    region_id,
    address: city,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userCheck = await client.query(
      `SELECT 1 FROM users 
       WHERE user_name = $1 OR user_email = $2 LIMIT 1`,
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "اسم المستخدم أو البريد الإلكتروني موجود مسبقاً",
      });
    }

    const result = await client.query(
      `INSERT INTO users 
       (user_name, password, user_phone, user_address, user_email, region_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, user_name, user_email`,
      [username, hashedPassword, phone, city, email, region_id]
    );

    await client.query("COMMIT");

// ✅  إرسال رسالة ترحيب على البريد
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
  from: `"كناري لطيور الزينة" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "🎉 أهلاً بك في  كناري للطيور و مرّبين الحيوانات الأليفة",
  html: `
    <div style="
      direction: rtl;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9fafb;
      padding: 30px;
      color: #1e293b;
      border-radius: 10px;
      max-width: 600px;
      margin: auto;
      border: 1px solid #cbd5e1;
    ">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0284c7; margin-top: 10px;">مرحباً بك في كناري 🐾</h2>
      </div>

      <p style="font-size: 16px;">أهلاً ${username}،</p>

      <p style="font-size: 16px;">
        يسعدنا انضمامك إلى عائلة <strong>كناري</strong>، المتجر الإلكتروني المفضل لمحبي <strong>الطيور والحيوانات الأليفة</strong>.
        نحن هنا لنقدم لك كل ما تحتاجه من طعام، مستلزمات، أعشاب، أقفاص، وإكسسوارات – وكل ذلك بجودة عالية وخدمة موثوقة.
      </p>

      <p style="font-size: 16px; margin-top: 15px;">
        نعمل دائماً على توفير أحدث المنتجات والعروض التي تلبي احتياجات حيواناتك الأليفة وتُسهل عليك العناية بها.
        اكتشف معنا تجربة تسوق مميزة وراحة بال كاملة.
      </p>

      <div style="
        font-size: 20px;
        font-weight: bold;
        color: #0f172a;
        background-color: #e0f2fe;
        padding: 15px 30px;
        border-radius: 10px;
        width: fit-content;
        margin: 25px auto;
        letter-spacing: 1px;
        text-align: center;
        border: 1px dashed #0284c7;
      ">
        زور موقعنا الآن وابدأ رحلتك مع كناري 🛒
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />

      <p style="font-size: 14px; color: #64748b;">
        نعتز بثقتك ونعدك بتجربة فريدة تهتم براحتك وراحة أليفك.
      </p>

      <p style="font-size: 14px; color: #64748b; margin-top: 5px;">
        مع تحيات فريق <strong>كناري</strong>
      </p>
    </div>
  `
});


    return res.status(201).json({
      success: true,
      user: result.rows[0],
      verified: true,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("فشل الإدراج:", {
      error: err.message,
      body: req.body,
      time: new Date(),
    });

    return res.status(500).json({
      error: "فشل في حفظ البيانات",
      technical: err.message,
    });
  } finally {
    client.release();
  }
};

// التحقق من اسم المستخدم وعرض البريد المخفي
const checkUsername = async (req, res) => {
  const { username } = req.body;

  try {
    const result = await pool.query(
      `SELECT user_id, user_email FROM users WHERE user_name = $1`,
      [username]
    );

    const exists = result.rows.length > 0;

    if (exists) {
      const email = result.rows[0].user_email;
      const maskedEmail = maskEmail(email);

      res.json({
        exists: true,
        email,
        maskedEmail,
      });
    } else {
      res.status(404).json({
        exists: false,
        message: "اسم المستخدم غير مسجل",
      });
    }
  } catch (err) {
    console.error("خطأ في التحقق:", err);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
};

// دالة إخفاء جزء من الإيميل
function maskEmail(email) {
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2);
  const hidden = "*".repeat(Math.max(name.length - 2, 0));
  return `${visible}${hidden}@${domain}`;
}

const sendVerificationCode = async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({
      success: false,
      message: "اسم المستخدم والبريد الإلكتروني مطلوبان",
    });
  }
// 🛡️ نظام تحديد عدد المحاولات (بحد أقصى 5 خلال ساعة)
  const now = Date.now();
  const windowSize = 60 * 60 * 1000; // ساعة
  const maxAttempts = 5;

  if (!global.rateLimitMap) {
    global.rateLimitMap = new Map();
  }

  const attempts = global.rateLimitMap.get(username) || [];
  const recentAttempts = attempts.filter((ts) => now - ts < windowSize);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: "لقد تجاوزت الحد الأقصى لعدد المحاولات. الرجاء المحاولة بعد ساعة.",
    });
  }
  try {
    // ✅ الخطوة 1: نتحقق إذا اسم المستخدم موجود
    const result = await pool.query(
      "SELECT user_email FROM users WHERE user_name = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "اسم المستخدم غير موجود" });
    }

    const dbEmail = result.rows[0].user_email;

    if (dbEmail.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ success: false, message: "البريد الإلكتروني غير مطابق للمستخدم" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة

    console.log(`🔐 رمز التحقق: ${code}`);
    console.log(`⏰ ينتهي في: ${expires.toLocaleString()}`);

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE user_name = $3 AND user_email = $4",
      [code, expires, username, email]
    );

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
  from: `" كناري لطيور الزينة" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "رمز تحقق _ كناري لطيور الزينة",
  html: `
    <div style="
      direction: rtl;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9fafb;
      padding: 30px;
      color: #1e293b;
      border-radius: 10px;
      max-width: 600px;
      margin: auto;
      border: 1px solid #cbd5e1;
    ">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0284c7; margin-top: 10px;">رمز التحقق الخاص بك</h2>
      </div>

      <p style="font-size: 16px;">مرحباً،</p>
      <p style="font-size: 16px;">لقد طلبت رمز تحقق لتسجيل الدخول أو استعادة كلمة المرور.</p>
      
      <div style="
        font-size: 28px;
        font-weight: bold;
        color: #0f172a;
        background-color: #e0f2fe;
        padding: 15px 30px;
        border-radius: 10px;
        width: fit-content;
        margin: 20px auto;
        letter-spacing: 8px;
        text-align: center;
        border: 1px dashed #0284c7;
      ">
        ${code}
      </div>

      <p style="font-size: 16px; margin-top: 20px;">
        يرجى استخدام هذا الرمز لإكمال عملية التحقق. الرمز صالح لمدة <strong>15 دقيقة فقط</strong>.
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />

      <p style="font-size: 14px; color: #64748b;">
        إذا لم تطلب رمز التحقق هذا، يمكنك تجاهل هذه الرسالة بأمان.
      </p>
      <p style="font-size: 14px; color: #64748b; margin-top: 5px;">مع تحيات فريق <strong> كناري لطيور الزينة</strong></p>
    </div>
  `,
});

    // ✅ سجل المحاولة بعد الإرسال الناجح
    recentAttempts.push(now);
    global.rateLimitMap.set(username, recentAttempts);

    res.json({ success: true });
  } catch (err) {
    console.error("فشل إرسال رمز التحقق:", err);
    res.status(500).json({ success: false, message: "فشل إرسال الرمز" });
  }
};

const verifyCode = async (req, res) => {
  const { username, code } = req.body;

  try {
    const result = await pool.query(
      "SELECT reset_token, reset_expires FROM users WHERE user_name = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "المستخدم غير موجود" });
    }

    const user = result.rows[0];

    const isExpired = new Date(user.reset_expires) <= new Date();
    const isCodeMatch = user.reset_token === code;

    if (!isCodeMatch) {
      return res.status(400).json({ success: false, message: "الرمز غير صحيح" }); // ✅ تم التعديل
    }

    if (isExpired) {
      return res.status(400).json({ success: false, message: "انتهت صلاحية الرمز" }); // ✅ تم التعديل
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("خطأ في التحقق:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  // التحقق من وجود البيانات المطلوبة
  if (!email || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      message: "يجب إدخال البريد الإلكتروني وكلمة المرور الجديدة" 
    });
  }

  // التحقق من صحة البريد الإلكتروني
  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: "صيغة البريد الإلكتروني غير صالحة"
    });
  }

  try {
    // 1. التحقق من وجود المستخدم
    const userCheck = await pool.query(
      'SELECT user_id FROM users WHERE user_email = $1',
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني"
      });
    }

    // 2. تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. تحديث كلمة المرور في قاعدة البيانات
    const result = await pool.query(
      `UPDATE users 
       SET password = $1, 
           reset_token = NULL, 
           reset_expires = NULL 
       WHERE user_email = $2 
       RETURNING user_id, user_name, user_email`,
      [hashedPassword, email]
    );

    // 4. إرسال رد النجاح
    return res.status(200).json({
      success: true,
      message: "تم تحديث كلمة المرور بنجاح",
      user: {
        id: result.rows[0].user_id,
        name: result.rows[0].user_name,
        email: result.rows[0].user_email
      }
    });

  } catch (error) {
    console.error("خطأ في إعادة تعيين كلمة المرور:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث كلمة المرور",
      error: error.message
    });
  }
};
// التصدير
module.exports = { loginUser, signupUser,checkUsername,sendVerificationCode ,verifyCode ,  resetPassword   };
