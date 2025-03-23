import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2';
import './App.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirm_password: '',
        selectusertype: ''
    });

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState([
        { description: 'At least 8 characters', isValid: false },
        { description: 'At least one uppercase letter', isValid: false },
        { description: 'At least one lowercase letter', isValid: false },
        { description: 'At least one number', isValid: false },
        { description: 'At least one special character', isValid: false }
    ]);

    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            validatePasswordRequirements(value);
        }
    };

    const validatePasswordRequirements = (password) => {
        const updatedRequirements = passwordRequirements.map(requirement => {
            switch (requirement.description) {
                case 'At least 8 characters':
                    requirement.isValid = password.length >= 8;
                    break;
                case 'At least one uppercase letter':
                    requirement.isValid = /[A-Z]/.test(password);
                    break;
                case 'At least one lowercase letter':
                    requirement.isValid = /[a-z]/.test(password);
                    break;
                case 'At least one number':
                    requirement.isValid = /\d/.test(password);
                    break;
                case 'At least one special character':
                    requirement.isValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                    break;
                default:
                    break;
            }
            return requirement;
        });
        setPasswordRequirements(updatedRequirements);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const validatePassword = () => {
        if (formData.password !== formData.confirm_password) {
            Swal.fire({
                icon: 'error',
                title: 'Password and Confirm Password do not match.',
                position: "top",
                showConfirmButton: true,
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email domain
        const collegeEmailPattern = /^[a-zA-Z0-9._%+-]+@psnacet\.edu\.in$/;
        if (!collegeEmailPattern.test(formData.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please use your college email (@psnacet.edu.in) to register.',
                showConfirmButton: true,
            });
            return;
        }

        // Validate password match
        if (!validatePassword()) return; 
        try {
            const response = await axios.post("http://localhost:5000/register", formData);

            Swal.fire({
                icon: 'success',
                title: response.data.message,
                showConfirmButton: true,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: error.response?.data?.message || 'An error occurred.',
                showConfirmButton: true,
            });
        }
    };

    return (
        <div className="center">
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <h1 className="container text-center fs-3">Create Account</h1>
                    <hr />
                    <div className="input-group mb-3">
                        <span className="input-group-text"><i className="bi bi-check2-circle"></i></span>
                        <div className="form-floating">
                            <select
                                className="form-select"
                                id="userType"
                                name="selectusertype"
                                value={formData.selectusertype}
                                onChange={handleChange}
                                required
                            >
                                <option value="">--Select Role--</option>
                                <option value="tutor">👨‍💼 tutor</option>
                                <option value="student">🎓 Student</option>
                            </select>
                            <label htmlFor="userType">Select User Type</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-person"></i></span>
                                <div className="form-floating">
                                    <input
                                        type="text"
                                        name="firstname"
                                        className="form-control"
                                        placeholder="Enter your firstname"
                                        value={formData.firstname}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="firstname">First Name</label>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-person"></i></span>
                                <div className="form-floating">
                                    <input
                                        type="text"
                                        name="lastname"
                                        className="form-control"
                                        placeholder="Enter your lastname"
                                        value={formData.lastname}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="lastname">Last Name</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
                        <div className="form-floating">
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter the email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="email">Email</label>
                        </div>
                    </div>
                    <div className="password-container">
                        <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-lock"></i></span>
                            <div className="form-floating">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    name="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    required
                                    placeholder="Enter the password"
                                />
                                <label htmlFor="password">Password</label>
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    id="showPassword"
                                    onClick={togglePasswordVisibility}
                                >
                                    <i className={passwordVisible ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}></i>
                                </button>
                            </div>
                        </div>
                        <div className={`password-requirements ${isPasswordFocused ? 'visible' : ''}`}>
                            <ul>
                                {passwordRequirements.map((requirement, index) => (
                                    <li key={index} className={requirement.isValid ? 'valid' : 'invalid'}>
                                        {requirement.isValid ? <i className="bi bi-check-circle-fill"></i> : <i className="bi bi-x-circle-fill"></i>}
                                        {requirement.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                        <div className="form-floating">
                            <input
                                type="password"
                                name="confirm_password"
                                className="form-control"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                                placeholder="Confirm your password"
                            />
                            <label htmlFor="confirm_password">Confirm Password</label>
                        </div>
                    </div>
                    
                    <input
                        type="submit"
                        className="btn btn-primary mt-3"
                        value="Create Account"
                    />
                    <br />
                    <br />
                    <center>
                        <b>Already have an account?</b>
                        <a href="/login" className="ms-1">Login</a>
                    </center>
                </form>
            </div>
        </div>
    );
};

export default Register;