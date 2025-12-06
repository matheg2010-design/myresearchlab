// Backend Server for بحثي Platform
// Node.js + Express + MySQL
// Author: محمود محمد عبدالرحيم

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bahithi_platform'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.warn('⚠️ Database connection failed:', err.message);
        console.warn('Running in demo mode without database. Email will still work.');
        // Continue without database for demo/development
        return;
    }
    console.log('✅ Connected to MySQL database');
    
    // Create tables if they don't exist
    createTables();
});

// Create database tables
function createTables() {
    const consultationsTable = `
        CREATE TABLE IF NOT EXISTS consultations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            help_type VARCHAR(100) NOT NULL,
            university VARCHAR(255),
            academic_level VARCHAR(50),
            message TEXT NOT NULL,
            attachment_path VARCHAR(500),
            deadline DATE,
            status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    const statistical_testsTable = `
        CREATE TABLE IF NOT EXISTS statistical_tests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            test_name VARCHAR(255) NOT NULL,
            category ENUM('parametric', 'non-parametric') NOT NULL,
            test_type VARCHAR(100) NOT NULL,
            description TEXT,
            conditions JSON,
            spss_steps JSON,
            excel_steps JSON,
            icon VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            university VARCHAR(255),
            academic_level VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    db.query(consultationsTable, (err) => {
        if (err) console.error('Error creating consultations table:', err);
        else console.log('Consultations table created/verified');
    });
    
    db.query(statistical_testsTable, (err) => {
        if (err) console.error('Error creating statistical_tests table:', err);
        else console.log('Statistical tests table created/verified');
    });
    
    db.query(usersTable, (err) => {
        if (err) console.error('Error creating users table:', err);
        else console.log('Users table created/verified');
    });
}

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, documents, and spreadsheets are allowed'));
        }
    }
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all statistical tests
app.get('/api/statistical-tests', (req, res) => {
    const query = 'SELECT * FROM statistical_tests';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching statistical tests:', err);
            return res.status(500).json({ error: 'Failed to fetch statistical tests' });
        }
        
        // Parse JSON fields
        const tests = results.map(test => ({
            ...test,
            conditions: JSON.parse(test.conditions || '[]'),
            spss_steps: JSON.parse(test.spss_steps || '[]'),
            excel_steps: JSON.parse(test.excel_steps || '[]')
        }));
        
        res.json(tests);
    });
});

// Submit consultation request
app.post('/api/consultations', upload.single('attachment'), async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            helpType,
            university,
            academicLevel,
            message,
            deadline
        } = req.body;
        
        const attachmentPath = req.file ? req.file.path : null;
        
        // Prepare consultation data
        const consultationData = {
            id: Date.now(),
            fullName,
            email,
            phone,
            helpType,
            university,
            academicLevel,
            message,
            attachmentPath,
            deadline,
            status: 'pending'
        };
        
        // Send email notification
        await sendConsultationEmail(consultationData);
        
        // Try to save to database if connected
        if (db.state === 'authenticated' || db.state === 'connected') {
            const query = `
                INSERT INTO consultations 
                (full_name, email, phone, help_type, university, academic_level, message, attachment_path, deadline)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                fullName,
                email,
                phone,
                helpType,
                university,
                academicLevel,
                message,
                attachmentPath,
                deadline || null
            ];
            
            db.query(query, values, (err, result) => {
                if (err) {
                    console.warn('Warning: Could not save to database:', err.message);
                } else {
                    console.log('Consultation saved to database with ID:', result.insertId);
                }
            });
        } else {
            console.log('Database not available. Consultation saved via email only.');
        }
        
        res.json({ 
            success: true, 
            message: 'Consultation request submitted successfully. Check your email for confirmation.',
            id: consultationData.id
        });
        
    } catch (error) {
        console.error('Error processing consultation request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get consultation status
app.get('/api/consultations/:id', (req, res) => {
    const consultationId = req.params.id;
    
    const query = 'SELECT * FROM consultations WHERE id = ?';
    
    db.query(query, [consultationId], (err, results) => {
        if (err) {
            console.error('Error fetching consultation:', err);
            return res.status(500).json({ error: 'Failed to fetch consultation' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Consultation not found' });
        }
        
        res.json(results[0]);
    });
});

// Update user information
app.post('/api/users', (req, res) => {
    const { email, fullName, phone, university, academicLevel } = req.body;
    
    const query = `
        INSERT INTO users (email, full_name, phone, university, academic_level)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        phone = VALUES(phone),
        university = VALUES(university),
        academic_level = VALUES(academic_level)
    `;
    
    const values = [email, fullName, phone, university, academicLevel];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving user:', err);
            return res.status(500).json({ error: 'Failed to save user information' });
        }
        
        res.json({ success: true, message: 'User information saved successfully' });
    });
});

// Email notification function
async function sendConsultationEmail(consultation) {
    try {
        // Email to consultant (Mahmood)
        const consultantMail = {
            from: process.env.EMAIL_USER,
            to: 'support@bahithi.com',
            subject: `طلب استشارة جديد - ${consultation.fullName}`,
            html: `
                <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
                    <h2>طلب استشارة جديد</h2>
                    <p><strong>رقم الطلب:</strong> #${consultation.id}</p>
                    <p><strong>الاسم:</strong> ${consultation.fullName}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${consultation.email}</p>
                    <p><strong>الهاتف:</strong> ${consultation.phone || 'غير محدد'}</p>
                    <p><strong>نوع المساعدة:</strong> ${consultation.helpType}</p>
                    <p><strong>الجامعة:</strong> ${consultation.university || 'غير محددة'}</p>
                    <p><strong>المستوى الأكاديمي:</strong> ${consultation.academicLevel || 'غير محدد'}</p>
                    <p><strong>الموعد النهائي:</strong> ${consultation.deadline || 'غير محدد'}</p>
                    <hr>
                    <h3>تفاصيل الطلب:</h3>
                    <p>${consultation.message}</p>
                </div>
            `
        };
        
        // Email to user
        const userMail = {
            from: process.env.EMAIL_USER,
            to: consultation.email,
            subject: 'تم استلام طلبك بنجاح - منصة بحثي',
            html: `
                <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
                    <h2>شكراً لتواصلك معنا</h2>
                    <p>عزيزي/عزيزتي ${consultation.fullName},</p>
                    <p>تم استلام طلبك بنجاح وسأقوم بالرد عليك خلال 24-48 ساعة.</p>
                    <p><strong>رقم الطلب:</strong> #${consultation.id}</p>
                    <p><strong>نوع المساعدة المطلوبة:</strong> ${consultation.helpType}</p>
                    <hr>
                    <p>إذا كان لديك أي استفسار عاجل، يمكنك الاتصال بي مباشرة على:</p>
                    <p><strong>الهاتف:</strong> +96894764758</p>
                    <p>مع أطيب التحيات،</p>
                    <p><strong>محمود محمد عبدالرحيم</strong></p>
                    <p>منصة بحثي</p>
                </div>
            `
        };
        
        await transporter.sendMail(consultantMail);
        await transporter.sendMail(userMail);
        
        console.log('Email notifications sent successfully');
        
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Initialize statistical tests data
function initializeStatisticalTests() {
    const tests = [
        {
            test_name: 'اختبار T (T-Test)',
            category: 'parametric',
            test_type: 'comparison',
            description: 'يستخدم لاختبار الفرق بين متوسطي مجموعتين مستقلتين أو متصلتين',
            conditions: JSON.stringify([
                'البيانات مستمرة',
                'التوزيع الطبيعي للبيانات',
                'تجانب التباين (للمجموعات المستقلة)'
            ]),
            spss_steps: JSON.stringify([
                'اختر Analyze → Compare Means → Independent-Samples T Test',
                'حدد المتغير التابع في Test Variable(s)',
                'حدد متغير التجميع في Grouping Variable',
                'اضغط على Define Groups وحدد قيم المجموعات',
                'اضغط OK للحصول على النتائج'
            ]),
            excel_steps: JSON.stringify([
                'استخدم الدالة T.TEST(array1, array2, tails, type)',
                'Array1: نطاق البيانات للمجموعة الأولى',
                'Array2: نطاق البيانات للمجموعة الثانية',
                'Tails: 1 للاختبار أحادي الجانب، 2 للثنائي',
                'Type: 1 لمجموعات مترابطة، 2 لمجموعات مستقلة'
            ]),
            icon: 'fas fa-not-equal'
        },
        {
            test_name: 'تحليل التباين (ANOVA)',
            category: 'parametric',
            test_type: 'comparison',
            description: 'يختبر الفرق بين متوسطات ثلاث مجموعات أو أكثر',
            conditions: JSON.stringify([
                'البيانات مستمرة',
                'التوزيع الطبيعي للبيانات',
                'تجانب التباين بين المجموعات',
                'استقلال المشاهدات'
            ]),
            spss_steps: JSON.stringify([
                'اختر Analyze → Compare Means → One-Way ANOVA',
                'حدد المتغير التابع في Dependent List',
                'حدد متغير التجميع في Factor',
                'اضغط على Post Hoc لاختبارات المقارنات المتعددة',
                'اختر طريقة الاختبار (مثل Tukey) واضغط Continue ثم OK'
            ]),
            excel_steps: JSON.stringify([
                'استخدم أداة Data Analysis → ANOVA: Single Factor',
                'حدد نطاق البيانات المدخلة',
                'حدد Alpha (عادة 0.05)',
                'اختر موقع النتائج واضغط OK'
            ]),
            icon: 'fas fa-layer-group'
        },
        {
            test_name: 'اختبار مربع كاي (Chi-Square)',
            category: 'non-parametric',
            test_type: 'association',
            description: 'يختبر العلاقة بين متغيرين تصنيفيين أو تطابق البيانات مع توزيع نظري',
            conditions: JSON.stringify([
                'البيانات تصنيفية',
                'الاستقلال المطلق',
                'الأعداد المتوقعة > 5 في كل خلية'
            ]),
            spss_steps: JSON.stringify([
                'اختر Analyze → Descriptive Statistics → Crosstabs',
                'حدد متغير الصفوف والأعمدة',
                'اضغط على Statistics واختر Chi-square',
                'اضغط على Cells واختر Expected وPercentages',
                'اضغط OK للحصول على النتائج'
            ]),
            excel_steps: JSON.stringify([
                'أنشئ جدول التكرارات المتقاطعة',
                'استخدم الدالة CHISQ.TEST(actual_range, expected_range)',
                'للحصول على القيمة الحرجة: CHISQ.INV.RT(probability, df)',
                'لحساب درجات الحرية: (rows-1) * (columns-1)'
            ]),
            icon: 'fas fa-th'
        }
    ];
    
    tests.forEach(test => {
        const query = `
            INSERT INTO statistical_tests (test_name, category, test_type, description, conditions, spss_steps, excel_steps, icon)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM statistical_tests WHERE test_name = ?
            )
        `;
        
        const values = [
            test.test_name, test.category, test.test_type, test.description,
            test.conditions, test.spss_steps, test.excel_steps, test.icon,
            test.test_name
        ];
        
        db.query(query, values, (err) => {
            if (err) console.error('Error inserting test:', err);
        });
    });
}

// Initialize statistical tests on server start
setTimeout(() => {
    if (db.state === 'authenticated' || db.state === 'connected') {
        initializeStatisticalTests();
    } else {
        console.log('Database not available. Skipping statistical tests initialization.');
    }
}, 1000);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Website: http://localhost:${PORT}`);
});

module.exports = app;