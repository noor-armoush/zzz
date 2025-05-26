const bcrypt = require('bcrypt');
const pool = require("../config/db");

const loginUser = async (req, res) => {
const bcrypt = require('bcrypt');
  console.log("hello from start of back end");

  const { username, password } = req.body;

  // تحقق من الإدخال
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "يجب إدخال اسم المستخدم وكلمة المرور",
    });
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
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
/*
    // 3. التحقق من كلمة المرور
    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        error: "كلمة المرور غير صحيحة",
      });
    }
*/

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
  
 const { username, password, phone, email, region_id, address: city } = req.body;

const hashedPassword = await bcrypt.hash(password, 10);

console.log("🔐 كلمة المرور المشفرة:", hashedPassword);

[username, hashedPassword, phone, city, email, region_id]


  const client = await pool.connect(); // استخدام اتصال منفصل

  try {
    await client.query('BEGIN'); // بدء المعاملة

    // 1. التحقق من المستخدم الموجود
    const userCheck = await client.query(
      `SELECT 1 FROM users 
       WHERE user_name = $1 OR user_email = $2 LIMIT 1`,
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: "اسم المستخدم أو البريد الإلكتروني موجود مسبقاً"
      });
    }

    // 2. إدراج المستخدم الجديد
    const result = await client.query(
      `INSERT INTO users 
       (user_name, password, user_phone, user_address, user_email, region_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, user_name, user_email`,
      [username,  hashedPassword, phone, city, email, region_id]
    );

    await client.query('COMMIT'); // تأكيد الحفظ

    // 3. التحقق من الإدراج فعلياً
    const verify = await client.query(
      'SELECT * FROM users WHERE user_id = $1',
      [result.rows[0].user_id]
    );

    if (verify.rows.length === 0) {
      throw new Error('فشل التحقق من الإدراج');
    }

    return res.status(201).json({
      success: true,
      user: result.rows[0],
      verified: true
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("فشل الإدراج:", {
      error: err.message,
      body: req.body,
      time: new Date()
    });

    return res.status(500).json({
      error: "فشل في حفظ البيانات",
      technical: err.message
    });
  } finally {
    client.release(); // تحرير الاتصال
  }
};

module.exports = { loginUser, signupUser };

