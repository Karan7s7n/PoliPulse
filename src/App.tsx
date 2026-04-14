import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import LandingPage from "./pages/LandingPage";
import AddEditPolicy from "./pages/AddEditPolicy";
import AdminPage from "./pages/AdminPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import { useTheme } from "./context/ThemeContext";
import type { Policy } from "./models/supabaseTypes";

// Background images
import darkBg from "./assets/dback.jpg";
import lightBg from "./assets/lbackg.jfif";

function App() {
  const { isDark } = useTheme();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  // 🔐 Auth Logic
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      // ✅ FIXED: Simple and reliable admin check
      const isEmailAdmin = data.session?.user?.email === "karansinghn.07@gmail.com";
      setIsAdmin(isEmailAdmin);

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        // ✅ Keep admin in sync
        const isEmailAdmin = session?.user?.email === "karansinghn.07@gmail.com";
        setIsAdmin(isEmailAdmin);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Loading...
      </div>
    );
  }

  return (
    <ProfileProvider>
      <div
        className="flex flex-col min-h-screen"
        style={{
          backgroundImage: `url(${isDark ? darkBg : lightBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* 🔝 Navbar */}
        {session && !isAdminPage && <Navbar />}

        {/* 📄 ROUTES */}
        <div
          className="grow transition-all duration-300"
          style={{
            paddingTop: session && !isAdminPage ? "90px" : "0px",
          }}
        >
          <Routes>

            <Route path="/" element={<LandingPage />} />

            {/* Legal Pages */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Auth */}
            <Route
              path="/auth"
              element={
                session ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <AuthPage />
                )
              }
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                session ? (
                  <HomePage
                    policies={policies}
                    setPolicies={setPolicies}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Protected Routes */}
            {(
              [
                ["/holder/:id", <HolderDetails />],
                ["/company/:id", <CompanyDetails />],
                ["/settings", <Settings />],
                ["/reports", <Reports policies={policies} setPolicies={setPolicies} />],
                ["/profile", <Profile />],
              ] as Array<[string, React.ReactNode]>
            ).map(([path, element]) => (
              <Route
                key={path}
                path={path}
                element={session ? (element as React.ReactElement) : <Navigate to="/" replace />}
              />
            ))}

            {/* Add/Edit */}
            <Route
              path="/add"
              element={
                session ? (
                  <AddEditPolicy
                    initialPolicies={policies}
                    setPolicies={setPolicies}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route
              path="/edit/:id"
              element={
                session ? (
                  <AddEditPolicy
                    initialPolicies={policies}
                    setPolicies={setPolicies}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* 🔥 ADMIN ROUTE (FIXED) */}
            <Route
              path="/admin"
              element={
                session ? (
                  isAdmin ? (
                    <AdminPage setIsAdmin={setIsAdmin} />
                  ) : (
                    <Navigate to="/dashboard" replace />   // ✅ FIXED HERE
                  )
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={session ? "/dashboard" : "/"} replace />}
            />
          </Routes>
        </div>

        {/* Footer */}
        {session && !isAdminPage && (
          <Footer version="v1.0.0" />
        )}
      </div>
    </ProfileProvider>
  );
}

export default App;
