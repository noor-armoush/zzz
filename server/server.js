const express = require('express');
const app = express();
require('dotenv').config();

// Middleware الأساسي (ضروري)
app.use(express.json()); // لمعالجة JSON
app.use(express.urlencoded({ extended: true })); // لمعالجة form-data

// CORS (إذا كنت تختبر من frontend)
const cors = require('cors');
app.use(cors());

// تسجيل الـ Routes (تأكد من المسار الصحيح)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Route بسيط للاختبار
app.get('/api/test', (req, res) => {
  res.json({ message: "الخادم يعمل!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`);
});