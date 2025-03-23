import React, { useState } from "react";
import Swal from "sweetalert2";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = window.location.pathname.split("/").pop(); // Extract token from URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Passwords do not match!",
      });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password too short",
        text: "Password should be at least 6 characters long.",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/reset-password/" + token, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Password Reset Successful",
          text: "Your password has been reset successfully.",
        }).then(() => {
        window.location.href = "/login"; // Redirect after success
      });
    } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to reset password.",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: "error",
        title: "An error occurred",
        text: "Please try again later.",
      });
    }
  };
  

  return (
    <div className= "d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: "400px" }}> 
        <div className="col-md-12">
          <h1 className="text-center">Reset Password</h1>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="form-group">
              <label className="mb-3" htmlFor="password">New Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="mt-4 mb-2" htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-4 text-center">
              Set New Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;