import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from 'sweetalert2';  // Import Swal for alerts

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  // Handle email input change
  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Email is required!',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Check your email',
          text: data.message,  // Backend should send a success message
          allowOutsideClick: false,  // Prevent closing alert by clicking outside
          confirmButtonText: "OK"
        }).then(() => {
          setTimeout(() => {
            window.location.href = '/login';  // Redirect after a short delay
          }, 3000);  // Adjust delay as needed
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message,  // Display the error message from the backend
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
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <form onSubmit={handleSubmit}>
          <h1 className="text-center">Forgot Password</h1>
          <hr />
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-envelope-fill"></i>
            </span>
            <div className="form-floating">
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={handleChange}
                required
              />
              <label htmlFor="email">Email</label>
            </div>
          </div>
          <div className="mb-3">
            <input
              className="btn btn-primary w-100"
              type="submit"
              value="Send Reset Link"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
