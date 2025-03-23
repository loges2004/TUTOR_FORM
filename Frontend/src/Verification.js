import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Verification = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status");
    const navigate = useNavigate();

    useEffect(() => {
        if (status === "success") {
            Swal.fire({
                title: "Success!",
                text: "Email verified successfully. You can now log in.",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                navigate("/login");
            });
        } else if (status === "invalid") {
            Swal.fire({
                title: "Error!",
                text: "Invalid or expired verification token.",
                icon: "error",
                confirmButtonText: "Try Again",
            }).then(() => {
                navigate("/register");
            });
        } else if (status === "error") {
            Swal.fire({
                title: "Error!",
                text: "An error occurred during verification.",
                icon: "error",
                confirmButtonText: "Try Again",
            }).then(() => {
                navigate("/register");
            });
        } else if (status === "missing") {
            Swal.fire({
                title: "Error!",
                text: "Verification token is missing.",
                icon: "error",
                confirmButtonText: "Try Again",
            }).then(() => {
                navigate("/register");
            });
        }
    }, [status, navigate]);

    return (
        <div className="container text-center mt-5">
            <h1>Email Verification</h1>
            <p>Please wait while we verify your email...</p>
        </div>
    );
};

export default Verification;
