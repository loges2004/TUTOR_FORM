// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
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

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/lk07')
    .then(() => console.log("Connected to MongoDB successfully."))
    .catch(err => console.error("Error connecting to MongoDB:", err.message));


// Unverified User Schema
const unverifiedUserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerificationToken: { type: String, default: null },
}, { collection: 'unverified_users' });

const UnverifiedUser = mongoose.model('UnverifiedUser', unverifiedUserSchema);

// Verified User Schema
const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

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
    const { firstname, lastname, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        const existingUnverifiedUser = await UnverifiedUser.findOne({ email });

        if (existingUser || existingUnverifiedUser) {
            return res.status(400).json({ message: 'Email is already registered or awaiting verification.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        const newUnverifiedUser = new UnverifiedUser({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            emailVerificationToken,
        });

        await newUnverifiedUser.save();

        const verificationLink = `http://localhost:5000/verify-email/${emailVerificationToken}`;
        await sendMail(email, 'Email Verification', `Click to verify your email: ${verificationLink}`);

        res.status(200).json({ message: 'Registration successful. Please verify your email.' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user.', error: err.message });
    }
});
app.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;

    try {
        if (!token) {
            return res.redirect('http://localhost:3000/verification?status=missing'); // Redirect to frontend
        }

        const unverifiedUser = await UnverifiedUser.findOne({ emailVerificationToken: token });

        if (!unverifiedUser) {
            return res.redirect('http://localhost:3000/verification?status=invalid'); // Redirect with error
        }

        // Create new user
        const newUser = new User({
            firstname: unverifiedUser.firstname,
            lastname: unverifiedUser.lastname,
            email: unverifiedUser.email,
            password: unverifiedUser.password,
        });

        await newUser.save();
        await UnverifiedUser.deleteOne({ email: unverifiedUser.email });

        console.log("✅ Email verified successfully!");

        return res.redirect('http://localhost:3000/verification?status=success'); // Redirect with success
    } catch (err) {
        console.error("❌ Error verifying email:", err.message);
        return res.redirect('http://localhost:3000/verification?status=error');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        res.status(200).json({ message: 'Login successful!' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// Forgot password route
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'No account with that email address exists.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        const resetLink = `http://localhost:3000/reset-password/${token}`;
        await sendMail(email, 'Password Reset', `Click to reset your password: ${resetLink}`);

        res.status(200).json({ message: 'Password reset link sent to email.' });
    } catch (err) {
        res.status(500).json({ message: 'Error sending password reset link.', error: err.message });
    }
});

// Reset password route
app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (err) {
        res.status(500).json({ message: 'Error resetting password.', error: err.message });
    }
});

// Serve React frontend
app.use(express.static(path.join(__dirname, '..', 'register-form', 'build')));

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'register-form', 'build', 'index.html'));
});
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});

