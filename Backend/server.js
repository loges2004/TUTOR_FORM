const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tutor_student_db',
    port: '4306'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
    } else {
        console.log('Connected to MySQL successfully.');
    }
});

// Helper function to send emails
const sendMail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = { to, from: process.env.EMAIL_USER, subject, text };
    await transporter.sendMail(mailOptions);
};

// Register route
app.post('/register', async (req, res) => {
    const { firstname, lastname, email, password, selectusertype } = req.body;

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database query error:', err.message);
                return res.status(500).json({ message: 'Database error.', error: err.message });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: 'Email is already registered.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const emailVerificationToken = crypto.randomBytes(32).toString('hex');
            
            db.query('INSERT INTO unverified_users (firstname, lastname, email, password, emailVerificationToken, selectusertype) VALUES (?, ?, ?, ?, ?, ?)', 
                [firstname, lastname, email, hashedPassword, emailVerificationToken, selectusertype], 
                async (err) => {
                    if (err) {
                        console.error('Error inserting into unverified_users:', err.message);
                        return res.status(500).json({ message: 'Error registering user.', error: err.message });
                    }
                    
                    const verificationLink = `http://localhost:5000/verify-email/${emailVerificationToken}`;
                    await sendMail(email, 'Email Verification', `Click to verify your email: ${verificationLink}`);
                    res.status(200).json({ message: 'Registration successful. Please verify your email.' });
                }
            );
        });
    } catch (err) {
        console.error('Unexpected error in /register:', err.message);
        res.status(500).json({ message: 'Error registering user.', error: err.message });
    }
});

// Email Verification
app.get('/verify-email/:token', (req, res) => {
    const { token } = req.params;
    
    db.query('SELECT * FROM unverified_users WHERE emailVerificationToken = ?', [token], (err, results) => {
        if (err || results.length === 0) {
            console.error('Invalid or expired token:', err?.message);
            return res.redirect('http://localhost:3000/verification?status=invalid');
        }
        
        const user = results[0];
        db.query('INSERT INTO users (firstname, lastname, email, password, selectusertype) VALUES (?, ?, ?, ?, ?)',
            [user.firstname, user.lastname, user.email, user.password, user.selectusertype],
            (err) => {
                if (err) {
                    console.error('Error inserting into users:', err.message);
                    return res.status(500).json({ message: 'Error verifying email.', error: err.message });
                }
                db.query('DELETE FROM unverified_users WHERE email = ?', [user.email]);
                res.redirect('http://localhost:3000/verification?status=success');
            }
        );
    });
});
// Login route
app.post('/login', (req, res) => {
    const { email, password, selectusertype } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) {
            console.error('Login error:', err?.message);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];

        // Validate password
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Validate user type
        if (user.selectusertype !== selectusertype) {
            return res.status(401).json({ message: `You are not authorized to login as ${selectusertype}.` });
        }

        // Login successful
        res.status(200).json({ message: 'Login successful!', user });
    });
});
// Forgot password route
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            console.error('Forgot password error:', err?.message);
            return res.status(400).json({ message: 'No account with that email address exists.' });
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 3600000;
        
        db.query('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?',
            [token, expiry, email], async (err) => {
                if (err) {
                    console.error('Error updating reset token:', err.message);
                    return res.status(500).json({ message: 'Database error.', error: err.message });
                }
                
                const resetLink = `http://localhost:3000/reset-password/${token}`;
                await sendMail(email, 'Password Reset', `Click to reset your password: ${resetLink}`);
                res.status(200).json({ message: 'Password reset link sent to email.' });
            }
        );
    });
});

// Reset password route
app.post('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    
    db.query('SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?', [token, Date.now()], async (err, results) => {
        if (err || results.length === 0) {
            console.error('Reset password error:', err?.message);
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.query('UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE email = ?',
            [hashedPassword, results[0].email],
            (err) => {
                if (err) {
                    console.error('Error resetting password:', err.message);
                    return res.status(500).json({ message: 'Error resetting password.', error: err.message });
                }
                res.status(200).json({ message: 'Password reset successful. You can now log in.' });
            }
        );
    });
});

// Serve React frontend
app.use(express.static(path.join(__dirname, '..', 'Frontend', 'build')));

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
});