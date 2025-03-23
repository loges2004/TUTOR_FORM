import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
        <div className="container-md">
          <a className="navbar-brand" href="#">
            <img src="images/logo-white.png" alt="PSNACET" height="60" />
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Contact
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="register.html">
                  Signup
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="login.html">
                  Login
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Carousel */}
      <div id="demo" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#demo"
            data-bs-slide-to="0"
            className="active"
          ></button>
          <button type="button" data-bs-target="#demo" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#demo" data-bs-slide-to="2"></button>
        </div>

        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="images/psna.jpg" alt="Los Angeles" className="d-block w-100" />
          </div>
          <div className="carousel-item">
            <img src="images/psna2.png" alt="Chicago" className="d-block w-100" />
          </div>
          <div className="carousel-item">
            <img src="images/psna.jpg" alt="New York" className="d-block w-100" />
          </div>
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#demo"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#demo"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* Dark Mode Toggle */}
      <div className="container text-center my-4">
        <label className="form-check-label">
          <input
            type="checkbox"
            className="form-check-input"
            onChange={toggleDarkMode}
          />
          Enable Dark Mode
        </label>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        body.dark-mode {
          background-color: black;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;