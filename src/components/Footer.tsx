import { motion } from "framer-motion";

interface FooterProps {
  version?: string;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

function Footer({ version = "v1.0.0", darkMode, setDarkMode }: FooterProps) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const buildDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // 🌈 Hybrid Theme (same as new navbar)
  const footerStyle = {
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    background: darkMode
      ? "rgba(240, 240, 240, 0.65)" // light-on-dark
      : "rgba(20, 20, 20, 0.55)",   // dark-on-light
    boxShadow: darkMode
      ? "0 4px 20px rgba(0,0,0,0.25)"
      : "0 -4px 20px rgba(0,0,0,0.35)",
    borderTop: darkMode
      ? "1px solid rgba(0,0,0,0.15)"
      : "1px solid rgba(255,255,255,0.12)",
    color: darkMode ? "#111" : "#f1f1f1",
  };

  const tileStyle = {
    padding: "10px 16px",
    borderRadius: "14px",
    background: darkMode
      ? "rgba(255,255,255,0.75)"
      : "rgba(255,255,255,0.1)",
    boxShadow: darkMode
      ? "inset 2px 2px 6px rgba(0,0,0,0.15), inset -2px -2px 6px rgba(255,255,255,0.4)"
      : "inset 2px 2px 6px rgba(255,255,255,0.1), inset -2px -2px 6px rgba(0,0,0,0.35)",
    color: darkMode ? "#111" : "#f4f4f4",
    fontWeight: 600,
  };

  return (
    <footer className="mt-auto py-4" style={footerStyle}>
      <div className="container text-center">

        {/* 🔗 Navigation Links */}
        <div className="d-flex justify-content-center flex-wrap gap-3 mb-3">
          {[
            { name: "Home", path: "/" },
            { name: "Analytics", path: "/reports" },
            { name: "Settings", path: "/settings" },
            { name: "Profile", path: "/profile" },
          ].map((item) => (
            <a
              key={item.path}
              href={item.path}
              style={tileStyle}
              className="text-decoration-none d-inline-block"
            >
              {item.name}
            </a>
          ))}
        </div>

        <hr
          style={{
            borderColor: darkMode
              ? "rgba(0,0,0,0.3)"
              : "rgba(255,255,255,0.3)",
          }}
        />

        {/* 🧾 Bottom Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">

          {/* © Info */}
          <div
            className="small fw-semibold"
            style={{ opacity: 0.8 }}
          >
            © {new Date().getFullYear()} PoliPulse — All rights reserved.
            <br />
            Version: {version} | Build: {buildDate}
          </div>

          {/* 🎛 Right Controls */}
          <div className="d-flex align-items-center mt-3 mt-md-0">

            {/* 🌍 Socials */}
            {["twitter", "linkedin", "github"].map((site) => (
              <a
                key={site}
                href={`https://${site}.com`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ opacity: 0.8, margin: "0 10px" }}
              >
                <i
                  className={`bi bi-${site}`}
                  style={{ fontSize: "1.3rem", color: darkMode ? "#111" : "#eee" }}
                ></i>
              </a>
            ))}

            {/* 🌗 Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="border-0 bg-transparent ms-2"
              style={{ fontSize: "1.6rem" }}
            >
              {darkMode ? (
                <i className="bi bi-moon-fill"></i>
              ) : (
                <i className="bi bi-sun-fill text-warning"></i>
              )}
            </motion.button>

            {/* 🔼 Scroll To Top */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className="border-0 ms-3"
              style={tileStyle}
            >
              ↑ Top
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
