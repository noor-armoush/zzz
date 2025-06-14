const bcrypt = require("bcrypt");
const pool = require("../config/db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const pool = require("../db");

const loginUser = async (req, res) => {
  const bcrypt = require("bcrypt");
  console.log("hello from start of back end");

  const { username, password } = req.body;

  // تحقق من الإدخال
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
    // 1. البحث عن المستخدم حسب الاسم أو البريد
    const result = await pool.query(
      `SELECT user_id, user_name, password FROM users 
       WHERE user_name = $1 OR user_email = $1`,
      [username.trim()]
    );

    // 2. التحقق من وجود المستخدم
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

    // 4. تسجيل الدخول ناجح - حذف كلمة المرور من البيانات الراجعة
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

const signupUser = async (req, res) => {
  console.log("hello from back end");

  const {
    username,
    password,
    phone,
    email,
    region_id,
    address: city,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("🔐 كلمة المرور المشفرة:", hashedPassword);

  [username, hashedPassword, phone, city, email, region_id];

  const client = await pool.connect(); // استخدام اتصال منفصل

  try {
    await client.query("BEGIN"); // بدء المعاملة

    // 1. التحقق من المستخدم الموجود
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

    // 2. إدراج المستخدم الجديد
    const result = await client.query(
      `INSERT INTO users 
       (user_name, password, user_phone, user_address, user_email, region_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, user_name, user_email`,
      [username, hashedPassword, phone, city, email, region_id]
    );

    await client.query("COMMIT"); // تأكيد الحفظ

    // 3. التحقق من الإدراج فعلياً
    const verify = await client.query(
      "SELECT * FROM users WHERE user_id = $1",
      [result.rows[0].user_id]
    );

    if (verify.rows.length === 0) {
      throw new Error("فشل التحقق من الإدراج");
    }

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
    client.release(); // تحرير الاتصال
  }
};

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

      // 🔐 توليد نسخة مخفية من الإيميل
      const maskedEmail = maskEmail(email);

      res.json({
        exists: true,
        email: email, // الإيميل الأصلي (اختياري حسب حاجتك)
        maskedEmail: maskedEmail, // الإيميل المخفي لإظهاره في الواجهة
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
// 🧠 دالة مساعدة لإخفاء الإيميل
function maskEmail(email) {
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2);
  const hidden = "*".repeat(Math.max(name.length - 2, 0));
  return `${visible}${hidden}@${domain}`;
}


// ✅ تحقق من البريد الإلكتروني
const verifyEmail = async (req, res) => {
  const { username, email } = req.body;

  try {
    const result = await pool.query(
      "SELECT user_email FROM users WHERE user_name = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false });
    }

    const dbEmail = result.rows[0].user_email;

    if (dbEmail.toLowerCase() === email.toLowerCase()) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (err) {
    console.error("خطأ في التحقق من الإيميل:", err);
    res.status(500).json({ success: false });
  }
};

// في المسار: /api/auth/send-verification-code
router.post("/send-verification-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "البريد مطلوب" });

  // توليد رمز عشوائي من 6 أرقام
  const code = Math.floor(100000 + Math.random() * 900000);

  // حفظه مؤقتًا في الذاكرة أو قاعدة بيانات (مثلاً Redis أو جدول خاص)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // بعد 15 دقيقة
  await db.query(
    "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
    [email, code, expiresAt]
  );

  // إرسال الإيميل (تحتاج nodemailer)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "رمز التحقق",
    text: `رمز التحقق الخاص بك هو: ${code}`
  });

  res.json({ success: true });
});

const sendVerificationCode = async (req, res) => {
  const { username, email } = req.body;

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // رمز 6 أرقام
    const expires = new Date(Date.now() + 15 * 60 * 1000); // صالح 15 دقيقة

    // تحديث الرمز بقاعدة البيانات
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE user_name = $3 AND user_email = $4",
      [code, expires, username, email]
    );

    // إعداد البريد
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
      from: `"كناري" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "رمز التحقق",
      text: `رمز التحقق الخاص بك هو: ${code}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "فشل إرسال الرمز" });
  }
};

module.exports = { sendVerificationCode };
// ✅ التصدير النهائي
module.exports = { loginUser, signupUser, checkUsername  , verifyEmail};
