import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { FaUserCircle, FaEdit } from "react-icons/fa";

// ------------------ Supabase init ------------------
const supabase = createClient(
  "https://shmvmxxhxvrnhlwdjcmp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXZteHhoeHZybmhsd2RqY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDAyMzMsImV4cCI6MjA3NTQ3NjIzM30.HpC27sRY0sxlz6QzqdKCzJJpDRnHEFT2uGcPl-gXo48"
);

// ------------------ Profile Context ------------------
interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ProfileContextType {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  loadingProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.user.id)
          .single();
        if (!error && data) setProfile(data);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loadingProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

// ------------------ Profile Page ------------------
interface ProfileProps {
  darkMode: boolean;
}

const ProfilePage: React.FC<ProfileProps> = ({ darkMode }) => {
  const { profile, setProfile, loadingProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
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

  // -------- Splash Screen --------
  if (showSplash) {
    return (
      <motion.div
        className={`d-flex flex-column justify-content-center align-items-center min-vh-100 ${
          darkMode ? "bg-dark text-light" : "bg-light text-dark"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.h1 className="fw-bold">PoliPulse</motion.h1>
      </motion.div>
    );
  }

  // -------- Loading --------
  if (loadingProfile) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center mt-5 text-danger">
        <p>No profile data found. Please log in again.</p>
      </div>
    );
  }

  // -------- Main About Me Page --------
  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="profile-about"
        className={`section about-section py-5 ${darkMode ? "" : "gray-bg"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div className="row align-items-center">
            {/* Avatar */}
            <div className="col-lg-4 text-center mb-4">
              <div className="about-avatar p-3 shadow-lg rounded-circle bg-white">
                <FaUserCircle size={180} className="text-primary" />
              </div>
            </div>

            {/* About Text */}
            <div className="col-lg-8">
              <div className="about-text go-to p-4 shadow-lg rounded-4 bg-white">
                <h3 className="dark-color mb-2">{profile.name}</h3>
                <h6 className="theme-color mb-3">PoliPulse User</h6>
                <p className="mb-4">
                  <mark>Manage and update</mark> your profile information. Keep your contact
                  details accurate to receive notifications about policy expiries and updates.
                </p>

                <div className="row about-list">
                  <div className="col-md-6">
                    <div className="media mb-3">
                      <label>Email</label>
                      <p>{profile.email}</p>
                    </div>
                    <div className="media mb-3">
                      <label>Phone</label>
                      <p>
                        <input
                          type="text"
                          value={profile.phone || ""}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          className="form-control"
                        />
                      </p>
                    </div>
                    <div className="media mb-3">
                      <label>Address</label>
                      <p>
                        <input
                          type="text"
                          value={profile.address || ""}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setProfile({ ...profile, address: e.target.value })
                          }
                          className="form-control"
                        />
                      </p>
                    </div>
                  </div>

                  <div className="col-md-6 d-flex flex-column justify-content-start">
                    <div className="media mb-3">
                      <label>Edit</label>
                      <p>
                        <button
                          className={`btn ${isEditing ? "btn-success" : "btn-primary"}`}
                          onClick={() =>
                            isEditing ? handleSaveProfile() : setIsEditing(true)
                          }
                        >
                          {isEditing ? "Save Changes" : "Edit Profile"} <FaEdit className="ms-2" />
                        </button>
                      </p>
                    </div>
                    <div className="media mb-3">
                      <label>Status</label>
                      <p className="text-success fw-semibold">{message}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.section>
    </AnimatePresence>
  );
};

// ------------------ Export wrapped in Provider ------------------
const ProfilePageWithProvider: React.FC<ProfileProps> = (props) => (
  <ProfileProvider>
    <ProfilePage {...props} />
  </ProfileProvider>
);

export default ProfilePageWithProvider;
