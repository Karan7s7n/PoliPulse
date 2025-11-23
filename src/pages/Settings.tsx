import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { useProfile } from "./Profile";
import {
  FaCog,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaGlobe,
  FaClock,
} from "react-icons/fa";
import { Button, Form, Card } from "react-bootstrap";
import darkLogo from "../assets/logo-dark.png";
import lightLogo from "../assets/logo-light.png";

// ✅ Supabase init
const supabase = createClient(
  "https://shmvmxxhxvrnhlwdjcmp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXZteHhoeHZybmhsd2RqY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDAyMzMsImV4cCI6MjA3NTQ3NjIzM30.HpC27sRY0sxlz6QzqdKCzJJpDRnHEFT2uGcPl-gXo48"
);

interface SettingsProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const Settings: React.FC<SettingsProps> = ({ darkMode, setDarkMode }) => {
  const { profile, setProfile, loadingProfile } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("UTC");

  // Splash screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      })
      .eq("id", profile.id);

    if (!error) {
      setMessage("✅ Profile updated successfully!");
      setIsEditing(false);
    } else {
      setMessage("❌ Failed to update profile.");
    }
  };

  // Splash Screen
  if (showSplash) {
    return (
      <motion.div
        className={`d-flex flex-column justify-content-center align-items-center min-vh-100 ${
          darkMode ? "bg-dark text-light" : "bg-light text-dark"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.img
          src={darkMode ? darkLogo : lightLogo}
          alt="PoliPulse Logo"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ width: 100, height: 100 }}
          className="mb-3"
        />
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fw-bold"
        >
          PoliPulse
        </motion.h1>
      </motion.div>
    );
  }

  if (loadingProfile)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );

  if (!profile)
    return (
      <div className="text-center mt-5 text-danger">
        <p>No profile data found. Please log in again.</p>
      </div>
    );

  return (
    <AnimatePresence>
      <motion.div
        className={`container py-5 ${darkMode ? "text-light" : "text-dark"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-center fw-bold mb-5">
          <FaCog className="me-2" /> Settings
        </h1>

        {/* 🌟 General Settings */}
        <Card
          className={`mb-4 p-4 shadow-lg border-0 ${
            darkMode ? "bg-dark text-light" : "bg-white text-dark"
          }`}
          style={{
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <h4 className="fw-bold mb-3">General Settings</h4>
          <hr />
          <Form.Check
            type="switch"
            id="dark-mode-switch"
            label="Enable Dark Mode"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="mb-3"
          />
          <Form.Group className="mb-3">
            <Form.Label>
              <FaClock className="me-2" /> Timezone
            </Form.Label>
            <Form.Select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="IST">India Standard Time (IST)</option>
              <option value="EST">Eastern Time (EST)</option>
              <option value="PST">Pacific Time (PST)</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>
              <FaGlobe className="me-2" /> Language
            </Form.Label>
            <Form.Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </Form.Select>
          </Form.Group>
        </Card>

        {/* 👤 Profile Settings */}
        <Card
          className={`mb-4 p-4 shadow-lg border-0 ${
            darkMode ? "bg-dark text-light" : "bg-white text-dark"
          }`}
          style={{
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <h4 className="fw-bold mb-3">Profile Information</h4>
          <hr />
          <div className="d-flex align-items-center mb-4">
            <FaUserCircle size={80} className="me-3" />
            <div>
              <h5 className="mb-1">{profile.name || "Unnamed User"}</h5>
              <p className="mb-0 text-muted">{profile.email}</p>
            </div>
          </div>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaEnvelope className="me-2" /> Email
              </Form.Label>
              <Form.Control type="email" value={profile.email} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaPhone className="me-2" /> Phone
              </Form.Label>
              <Form.Control
                type="text"
                value={profile.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaMapMarkerAlt className="me-2" /> Address
              </Form.Label>
              <Form.Control
                type="text"
                value={profile.address || ""}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                disabled={!isEditing}
              />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button
                variant={isEditing ? "success" : "primary"}
                onClick={() =>
                  isEditing ? handleSaveProfile() : setIsEditing(true)
                }
              >
                {isEditing ? "Save Changes" : "Edit Profile"} <FaEdit className="ms-2" />
              </Button>
              <p className="mb-0 text-success">{message}</p>
            </div>
          </Form>
        </Card>

        {/* 🔔 Notifications */}
        
      </motion.div>
    </AnimatePresence>
  );
};

export default Settings;
