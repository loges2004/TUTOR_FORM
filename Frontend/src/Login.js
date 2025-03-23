import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        selectusertype: '', // Add selectusertype to the form state
    });

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic client-side validation
        if (!formData.email || !formData.password || !formData.selectusertype) {
            Swal.fire({
                icon: 'error',
                title: 'All fields are required!',
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    text: data.message,
                    timer: 2000,
                    showConfirmButton: true,
                    allowOutsideClick: false,
                }).then(() => {
                    // Redirect based on user type
                    if (formData.selectusertype === 'tutor') {
                        window.location.href = '/tutor_dashboard';
                    } else if (formData.selectusertype === 'student') {
                        window.location.href = '/student_dashboard';
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.message,
                });
            }
        } catch (err) {
            console.error('Error:', err);
            Swal.fire({
                icon: 'error',
                title: 'An error occurred. Please try again.',
            });
        }
    };

    return (
        <div className="center">
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <h1 className="text-center">Login</h1>
                    <hr />
                    <div className="input-group mb-3">
                        <span className="input-group-text"><i className="bi bi-person-check"></i></span>
                        <div className="form-floating">
                            <select
                                id="selectusertype"
                                name="selectusertype"
                                className="form-select"
                                value={formData.selectusertype}
                                onChange={handleChange}
                                required
                            >
                                <option value="">--Select User Type--</option>
                                <option value="tutor">👨‍💼 tutor</option>
                                <option value="student">🎓 Student</option>
                            </select>
                            <label htmlFor="selectusertype">User Type</label>
                        </div>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
                        <div className="form-floating">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="email">Email</label>
                        </div>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text"><i className="bi bi-lock"></i></span>
                        <div className="form-floating">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="password">Password</label>
                        </div>
                    </div>
                    
                    <div className="mb-3">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>
                    <div className="mb-3">
                        <input
                            className="btn btn-primary w-100"
                            type="submit"
                            value="Login"
                        />
                    </div>
                    <div className="text-center mb-3">
                        <span><strong> Don't have an account?</strong></span>
                        <Link to="/register">Signup</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;