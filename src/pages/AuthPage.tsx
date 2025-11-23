import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../models/supabaseClient";
import { motion } from "framer-motion";
import {
  FaUser,
  FaLock,
  FaGoogle,
  FaGithub,
  FaLinkedin,
  FaMicrosoft,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

interface AuthPageProps {
  darkMode: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ darkMode }) => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // -------------------------------
  // ✔ SIGN IN / SIGN UP
  // -------------------------------
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setMessage("✅ Logged in successfully!");

        // Redirect to home after login
        setTimeout(() => navigate("/"), 500);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        setMessage("✅ Signup successful! Check your email to verify your account.");
      }
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // ✔ FORGOT PASSWORD
  // -------------------------------
  const handleForgotPassword = async () => {
    if (!email) return setMessage("⚠️ Enter your email to reset password.");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });

    if (error) setMessage(`❌ ${error.message}`);
    else setMessage("✅ Password reset link sent to your email.");
  };

  // -------------------------------
  // ✔ OAUTH LOGIN
  // -------------------------------
  const handleOAuthLogin = async (
    provider: "google" | "github" | "linkedin" | "azure"
  ) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
      setLoading(false);
    }
  };

  // -------------------------------
  // JSX SECTION
  // -------------------------------
  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #121212, #1c1c1c)"
          : "linear-gradient(135deg, #f8f9fa, #e9ecef)",
      }}
    >
      <motion.div
        className="row w-75 shadow-lg rounded-4 overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Left Section */}
        <div
          className="col-md-6 d-flex flex-column justify-content-center text-center p-5"
          style={{
            background: darkMode
              ? "linear-gradient(135deg, #2a2a2a, #3b3b3b)"
              : "linear-gradient(135deg, #363434, #6b6767)",
            color: darkMode ? "#f1f1f1" : "#212529",
          }}
        >
          <h1
            className="fw-bold mb-3"
            style={{
              color: darkMode ? "#212529" : "#f8f9fa",
            }}
          >
            WELCOME
          </h1>

          <p className="mb-0">
            Manage your insurance policies easily with{" "}
            <strong
              style={{
                color: darkMode ? "#212529" : "#f8f9fa",
              }}
            >
              PoliPulse
            </strong>
          </p>
        </div>

        {/* Right Section */}
        <div
          className="col-md-6 p-5"
          style={{
            backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
            color: darkMode ? "#f8f9fa" : "#212529",
          }}
        >
          <h3 className="fw-bold mb-4 text-center">
            {isLogin ? "Sign In" : "Sign Up"}
          </h3>

          <form onSubmit={handleAuth}>
            {/* Email */}
            <div className="mb-3 input-group">
              <span
                className={`input-group-text ${
                  darkMode ? "bg-dark text-light border-secondary" : ""
                }`}
              >
                <FaUser />
              </span>
              <input
                type="email"
                className={`form-control ${
                  darkMode
                    ? "bg-dark text-light border-secondary"
                    : "bg-white text-dark"
                }`}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3 input-group">
              <span
                className={`input-group-text ${
                  darkMode ? "bg-dark text-light border-secondary" : ""
                }`}
              >
                <FaLock />
              </span>
              <input
                type="password"
                className={`form-control ${
                  darkMode
                    ? "bg-dark text-light border-secondary"
                    : "bg-white text-dark"
                }`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <small
                role="button"
                onClick={handleForgotPassword}
                className={darkMode ? "text-info" : "text-primary"}
              >
                Forgot Password?
              </small>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn w-100 fw-semibold border-0 rounded-pill py-2 mt-2"
              style={{
                background: darkMode
                  ? "linear-gradient(90deg, #4d4d4e, #7b7a7c)"
                  : "linear-gradient(90deg, #404041, #696a6b)",
                color: "#fff",
                boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
              }}
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="text-center my-3 text-muted">or</div>

          {/* OAuth */}
          <div className="d-flex justify-content-around">
            <button
              onClick={() => handleOAuthLogin("google")}
              className={`btn ${
                darkMode ? "btn-outline-light border-secondary" : "btn-outline-dark"
              }`}
            >
              <FaGoogle />
            </button>

            <button
              onClick={() => handleOAuthLogin("github")}
              className={`btn ${
                darkMode ? "btn-outline-light border-secondary" : "btn-outline-dark"
              }`}
            >
              <FaGithub />
            </button>

            <button
              onClick={() => handleOAuthLogin("linkedin")}
              className={`btn ${
                darkMode ? "btn-outline-light border-secondary" : "btn-outline-dark"
              }`}
            >
              <FaLinkedin />
            </button>

            <button
              onClick={() => handleOAuthLogin("azure")}
              className={`btn ${
                darkMode ? "btn-outline-light border-secondary" : "btn-outline-dark"
              }`}
            >
              <FaMicrosoft />
            </button>
          </div>

          {/* Message */}
          {message && (
            <p className="text-center mt-3 small text-warning">{message}</p>
          )}

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center mt-4">
            <small>
              {isLogin ? "Don’t have an account?" : "Already registered?"}
            </small>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ms-2 border-0 rounded-pill px-3 py-1 fw-semibold text-white"
              style={{
                background: darkMode
                  ? "linear-gradient(90deg, #4d4d4e, #7b7a7c)"
                  : "linear-gradient(90deg, #404041, #696a6b)",
              }}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
