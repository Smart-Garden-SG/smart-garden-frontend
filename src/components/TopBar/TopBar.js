import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import "../styles.css";
import "./TopBar.css";

function TopBar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-icon-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="top-bar">
      {/* Logo e texto */}
      <Link to="/dashboard" className="logo-container">
        <img src={logo} alt="Smart Garden Logo" width="32" height="32" />
        <span className="logo-text">Smart Garden</span>
      </Link>

      {/* Ícones de autenticação */}
      <div className="auth-icons">
        {isLoggedIn && (
          <div
            className="user-icon-container"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <i className="fa-solid fa-user user-icon"></i>
            
            {/* Dropdown para "Sair" */}
            <div className={`dropdown-menu ${showDropdown ? "show" : ""}`}>
              <button onClick={handleLogout} className="dropdown-item">
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopBar;
