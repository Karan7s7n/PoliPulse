import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "./models/supabaseClient";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import HolderDetails from "./pages/HolderDetails";
import CompanyDetails from "./pages/CompanyDetails";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Profile, { ProfileProvider } from "./pages/Profile";
import AuthPage from "./pages/AuthPage";
import AddEditPolicy from "./pages/AddEditPolicy";
import type { Policy } from "./models/supabaseTypes";

// 🔹 Import background images
import darkBg from "./assets/dback.jpg";
import lightBg from "./assets/lback.jpg";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Authentication logic
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ⏳ Session loading
  if (loading) {
    return (
      <motion.div
        className={`flex items-center justify-center min-h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg font-semibold"
        >
          Loading...
        </motion.div>
      </motion.div>
    );
  }

  return (
    <ProfileProvider>
      <div
        className={`d-flex flex-column min-vh-100`}
        style={{
          backgroundImage: `url(${darkMode ? darkBg : lightBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* 🔝 Navbar only if logged in */}
        {session && <Navbar darkMode={darkMode} />}

        {/* 📄 Main content */}
        <div className="flex-grow-1">
          <Routes>
            {/* 🔐 Auth Page */}
            <Route path="/auth" element={<AuthPage darkMode={darkMode} />} />

            {/* 🏠 Protected Routes */}
            <Route
              path="/"
              element={
                session ? (
                  <HomePage
                    darkMode={darkMode}
                    policies={policies}
                    setPolicies={setPolicies}
                  />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/holder/:id"
              element={
                session ? (
                  <HolderDetails darkMode={darkMode} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/company/:id"
              element={
                session ? (
                  <CompanyDetails darkMode={darkMode} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/settings"
              element={
                session ? (
                  <Settings darkMode={darkMode} setDarkMode={setDarkMode} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/reports"
              element={
                session ? (
                  <Reports darkMode={darkMode} policies={policies} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/add"
              element={
                session ? (
                  <AddEditPolicy
                    darkMode={darkMode}
                    policies={policies}
                    setPolicies={setPolicies}
                  />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/edit/:id"
              element={
                session ? (
                  <AddEditPolicy
                    darkMode={darkMode}
                    policies={policies}
                    setPolicies={setPolicies}
                  />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/profile"
              element={
                session ? <Profile darkMode={darkMode} /> : <Navigate to="/auth" replace />
              }
            />

            {/* Default redirect */}
            <Route
              path="*"
              element={<Navigate to={session ? "/" : "/auth"} replace />}
            />
          </Routes>
        </div>

        {/*  Footer  */}
        {session && (
          <Footer
            version="v1.0.0"
            darkMode={darkMode}
            setDarkMode={setDarkMode} 
          />
        )}
      </div>
    </ProfileProvider>
  );
}

export default App;
