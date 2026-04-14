import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Database, Bell, Users, Globe, Mail } from "lucide-react";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";

const Section = ({ icon: Icon, title, children, isDark }: any) => (
  <div className={`p-8 rounded-[2rem] border transition-all ${isDark ? "bg-zinc-900/60 border-zinc-800/60 hover:border-indigo-500/30" : "bg-white hover:shadow-xl border-slate-200"}`}>
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg flex-shrink-0">
        <Icon size={22} />
      </div>
      <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h2>
    </div>
    <div className={`space-y-4 text-sm leading-relaxed font-medium ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
      {children}
    </div>
  </div>
);

const Highlight = ({ children, isDark }: any) => (
  <span className={`font-black ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>{children}</span>
);

export default function PrivacyPage() {
  const { isDark } = useTheme();
  const lastUpdated = "April 5, 2026";

  return (
    <div className={`min-h-screen ${isDark ? "text-white" : "text-slate-900"}`}>

      {/* ✨ Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <img src={isDark ? logoLight : logoDark} alt="PoliPulse" className="w-16 h-16 rounded-2xl shadow-2xl rotate-3" />
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${isDark ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border border-indigo-200"}`}>
            <Shield size={12} />
            Privacy Policy
          </div>
          <h1 className={`text-5xl md:text-6xl font-black tracking-tighter mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Your Privacy,<br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Our Commitment</span>
          </h1>
          <p className={`text-lg font-medium max-w-2xl mx-auto ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
            At PoliPulse, your data is your asset. We are transparent about what we collect, why we collect it, and how you can control it.
          </p>
          <div className={`mt-6 text-xs font-black uppercase tracking-widest opacity-40 ${isDark ? "text-white" : "text-black"}`}>
            Last updated: {lastUpdated}
          </div>
        </div>
      </div>

      {/* 📚 Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-6">

        <Section icon={Eye} title="Information We Collect" isDark={isDark}>
          <p>We collect information you directly provide when you create an account or use our services. This includes:</p>
          <ul className="list-none space-y-2 mt-4">
            {["Your <b>email address</b> used to create and secure your PoliPulse account.", "Insurance <b>policy data</b> you manually enter, including client names, company names, premium amounts, and renewal dates.", "<b>Profile information</b> such as your display name, avatar, and subscription tier.", "Technical metadata such as <b>IP address, browser type, and device information</b> to protect against unauthorized access."].map((item, i) => (
              <li key={i} className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={Database} title="How We Use Your Data" isDark={isDark}>
          <p>Your data is used exclusively to provide and improve the PoliPulse service. Specifically:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              { label: "Service Delivery", desc: "To show you your policies and generate analytics dashboards." },
              { label: "Account Security", desc: "To authenticate your identity and prevent unauthorized access." },
              { label: "Notifications", desc: "To alert you of policy renewals and critical expiry dates." },
              { label: "Platform Improvement", desc: "Aggregated, anonymized usage patterns to enhance the product." },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"}`}>
                <div className={`font-black text-sm mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>{item.label}</div>
                <div>{item.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Lock} title="Data Security" isDark={isDark}>
          <p>Security is not an afterthought at PoliPulse — it is foundational to everything we build.</p>
          <p>We use <Highlight isDark={isDark}>Supabase's enterprise-grade infrastructure</Highlight> with Row-Level Security (RLS) to ensure your policy data is completely isolated from other users — at the database level.</p>
          <p>All data in transit is encrypted via <Highlight isDark={isDark}>TLS 1.3</Highlight>. At rest, your data is encrypted using <Highlight isDark={isDark}>AES-256</Highlight>. We do not store plain-text passwords. Authentication is handled via secure JWT tokens with automatic refresh.</p>
          <p>We conduct regular security audits and do not allow employee access to your personal policy data without your explicit consent.</p>
        </Section>

        <Section icon={Users} title="Data Sharing" isDark={isDark}>
          <p>We have a simple policy: <Highlight isDark={isDark}>We do not sell your data. Ever.</Highlight></p>
          <p>Data is only shared with the following parties to provide you the service:</p>
          <ul className="space-y-2 mt-3">
            {[
              "Supabase Inc. — as our database and authentication infrastructure provider.",
              "Vercel Inc. — as our hosting and content delivery provider.",
              "Law enforcement or government bodies — only when legally required and with proper documentation.",
            ].map((item, i) => (
              <li key={i} className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={Bell} title="Your Rights & Choices" isDark={isDark}>
          <p>You are in complete control of your data. You have the right to:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {["Access all personal data we hold about you", "Request correction of any inaccurate information", "Delete your account and all associated data permanently", "Export your policy data in CSV format at any time", "Opt out of non-essential communications", "Object to certain forms of data processing"].map((right, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl font-bold text-xs ${isDark ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                {right}
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Globe} title="Cookies & Tracking" isDark={isDark}>
          <p>PoliPulse uses only <Highlight isDark={isDark}>strictly necessary cookies</Highlight> to maintain your authentication session. We do not use:</p>
          <ul className="space-y-2 mt-3">
            {["Third-party advertising cookies", "Cross-site tracking pixels", "Behavioral profiling tools", "Social media tracking scripts"].map((item, i) => (
              <li key={i} className={`flex items-center gap-3 p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <span className="text-red-500 font-black text-base">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={Mail} title="Contact Us" isDark={isDark}>
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to our Data Protection Team:</p>
          <div className={`mt-4 p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"}`}>
            <div className={`font-black mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>PoliPulse Data Team</div>
            <a href="mailto:privacy@polipulse.com" className="text-indigo-500 hover:text-indigo-400 font-bold transition-colors">privacy@polipulse.com</a>
            <p className="mt-2 text-xs opacity-60">We respond to all privacy requests within 5 business days.</p>
          </div>
        </Section>

        {/* Back Link */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
          <Link to="/" className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isDark ? "bg-white/5 text-white hover:bg-white/10 border border-white/5" : "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200"}`}>
            ← Back to Home
          </Link>
          <Link to="/terms" className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
