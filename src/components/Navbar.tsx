import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaEdit } from "react-icons/fa";
import { supabase } from "../models/supabaseClient";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

interface NavbarProps {
  darkMode: boolean;
}

function Navbar({ darkMode }: NavbarProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/reports", label: "Analytics", icon: "📊" },
    { path: "/add", label: "Policy", icon: <FaEdit /> },
  ];


  const logoSrc = darkMode ? "/logo2.png" : "/logo1.png";

  const sidebarClass = `profile-sidebar ${sidebarOpen ? "open" : ""}`;
  const overlayClass = sidebarOpen
    ? "sidebar-overlay active"
    : "sidebar-overlay";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSidebarOpen(false);
      navigate("/auth");
    } catch {
      alert("Logout failed");
    }
  };

  return (
    <>
      {/* 🌐 NAVBAR — now with sidebar theme style */}
      {/* 🌐 NAVBAR with inverse theme */}
<nav
  className="navbar shadow-sm"
  style={{
    padding: "12px 20px",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderBottom: darkMode
      ? "1px solid rgba(0,0,0,0.12)"
      : "1px solid rgba(255,255,255,0.3)",

    // 🌙 Inverse Theme
    background: darkMode
      ? "rgba(255, 255, 255, 0.55)"   // Light navbar on dark mode
      : "rgba(15, 15, 15, 0.55)",     // Dark navbar on light mode

    // Subtle shadow for floating effect
    boxShadow: darkMode
      ? "0 4px 20px rgba(255,255,255,0.15)"
      : "0 4px 20px rgba(0,0,0,0.25)",

    color: darkMode ? "black" : "white",
  }}
>
  <div
    className="container-fluid d-flex align-items-center"
    style={{ position: "relative" }}
  >
    {/* Centered Logo + App Name */}
    <div
      className="position-absolute start-50 translate-middle-x d-flex align-items-center"
      style={{ pointerEvents: "none" }}
    >
      <img
        src={logoSrc}
        alt="App logo"
        style={{
          height: "32px",
          width: "32px",
          borderRadius: "8px",
          marginRight: "10px",
          filter: darkMode ? "none" : "brightness(1.1)",
        }}
      />
      <span
        className="fw-bold fs-5"
        style={{
          color: darkMode ? "#111" : "#f5f5f5",
          letterSpacing: "0.5px",
        }}
      >
        PoliPulse
      </span>
    </div>

    {/* Menu Icon (Right Aligned) */}
    <button
      className="btn"
      onClick={() => setSidebarOpen(true)}
      style={{
        marginLeft: "auto",
        color: darkMode ? "#111" : "#f5f5f5",
        background: darkMode
          ? "rgba(0,0,0,0.06)"
          : "rgba(255,255,255,0.15)",
        padding: "8px 12px",
        borderRadius: "12px",
        backdropFilter: "blur(8px)",
      }}
    >
      <FaBars size={22} />
    </button>
  </div>
</nav>


      {/* Background Overlay */}
      <div className={overlayClass} onClick={() => setSidebarOpen(false)} />

      {/* 📱 RIGHT SIDEBAR */}
      <div
        className={sidebarClass}
        style={{
          width: "28vw", // widened from 25%
          maxWidth: "360px",
          background: darkMode
            ? "rgba(20,20,20,0.6)"
            : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: darkMode
            ? "8px 0 25px rgba(0,0,0,0.6)"
            : "8px 0 25px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo Block */}
        <div
          className="text-center p-4"
          style={{
            borderBottom: darkMode
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="mx-auto d-flex justify-content-center align-items-center"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "20px",
              background: darkMode ? "#f8f9fa" : "#222",
            }}
          >
            <img
              src={logoSrc}
              alt="App Logo"
              style={{ width: "65px", height: "65px", borderRadius: "12px" }}
            />
          </div>

          <h4
  className="mt-3 fw-bold"
  style={{
    color: darkMode ? "#f1f1f1" : "#111",   // Adjusted for theme
    letterSpacing: "0.5px",
  }}
>
  PoliPulse
</h4>

<p
  className="m-0"
  style={{
    color: darkMode ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
  }}
>
  Secure. Reliable. Smart.
</p>

        </div>

        {/* Menu Items */}
        <div className="px-4 mt-4">
          <h6 className="opacity-75 mb-2" style={{
    color: darkMode ? "#f1f1f1" : "#111",   // Adjusted for theme
    letterSpacing: "0.5px",
  }}>MENU</h6>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-decoration-none"
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className="menu-tile"
                style={{
                  padding: "14px 18px",
                  marginBottom: "14px",
                  borderRadius: "18px",
                  background: darkMode
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.85)",
                  color: darkMode ? "white" : "black",
                }}
              >
                {link.icon} <span className="ms-2">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Profile + Logout */}
        <div className="px-4 mt-4">
          <h6 className="opacity-75 mb-2" style={{
    color: darkMode ? "#f1f1f1" : "#111",   // Adjusted for theme
    letterSpacing: "0.5px",
  }}>PROFILE</h6>

          <Link
            to="/profile"
            className="text-decoration-none"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="menu-tile"
              style={{
                padding: "14px 18px",
                borderRadius: "18px",
                marginBottom: "14px",
                background: darkMode
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(255,255,255,0.85)",
                color: darkMode ? "white" : "black",
              }}
            >
              👤 Profile
            </div>
          </Link>
          <Link
    to="/settings"
    className="text-decoration-none"
    onClick={() => setSidebarOpen(false)}
  >
    <div
      className="menu-tile"
      style={{
        padding: "14px 18px",
        borderRadius: "18px",
        marginBottom: "14px",
        background: darkMode
          ? "rgba(255,255,255,0.07)"
          : "rgba(255,255,255,0.85)",
        color: darkMode ? "white" : "black",
      }}
    >
      ⚙️ Settings
    </div>
  </Link>

          <button
            onClick={handleLogout}
            className="w-100"
            style={{
              padding: "14px 18px",
              borderRadius: "18px",
              background: "rgba(255,60,60,0.25)",
              color: darkMode ? "#ff6b6b" : "#c0392b",
              border: "none",
              fontWeight: 600,
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Close Button */}
        <button
          className="close-sidebar-btn"
          onClick={() => setSidebarOpen(false)}
        >
          <FaTimes size={22} />
        </button>
      </div>
    </>
  );
}

export default Navbar;
