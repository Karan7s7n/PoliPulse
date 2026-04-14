import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import { FileText, AlertCircle, CheckCircle, XCircle, Scale, Briefcase, RefreshCw, Mail } from "lucide-react";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";

const Section = ({ icon: Icon, title, children, isDark }: any) => (
  <div className={`p-8 rounded-[2rem] border transition-all ${isDark ? "bg-zinc-900/60 border-zinc-800/60 hover:border-purple-500/30" : "bg-white hover:shadow-xl border-slate-200"}`}>
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg flex-shrink-0">
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
  <span className={`font-black ${isDark ? "text-purple-400" : "text-purple-600"}`}>{children}</span>
);

const Clause = ({ title, children, isDark }: any) => (
  <div className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"}`}>
    <div className={`font-black text-sm mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</div>
    <div>{children}</div>
  </div>
);

export default function TermsPage() {
  const { isDark } = useTheme();
  const lastUpdated = "April 5, 2026";

  return (
    <div className={`min-h-screen ${isDark ? "text-white" : "text-slate-900"}`}>

      {/* ✨ Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <img src={isDark ? logoLight : logoDark} alt="PoliPulse" className="w-16 h-16 rounded-2xl shadow-2xl -rotate-3" />
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${isDark ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-600 border border-purple-200"}`}>
            <FileText size={12} />
            Terms of Service
          </div>
          <h1 className={`text-5xl md:text-6xl font-black tracking-tighter mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Fair Terms,<br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">Clear Agreement</span>
          </h1>
          <p className={`text-lg font-medium max-w-2xl mx-auto ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
            By using PoliPulse, you agree to these terms. We have written them to be as clear and fair as possible.
          </p>
          <div className={`mt-6 text-xs font-black uppercase tracking-widest opacity-40 ${isDark ? "text-white" : "text-black"}`}>
            Last updated: {lastUpdated} · Effective immediately upon account creation
          </div>
        </div>
      </div>

      {/* 📋 Key Terms Summary */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className={`p-6 rounded-[2rem] border ${isDark ? "bg-indigo-500/5 border-indigo-500/20" : "bg-indigo-50 border-indigo-200"}`}>
          <div className={`text-xs uppercase font-black tracking-widest mb-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>⚡ Quick Summary — The Essentials</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: CheckCircle, color: "text-emerald-500", text: "You own all your data. We never sell it." },
              { icon: CheckCircle, color: "text-emerald-500", text: "Free plan is free. No hidden charges." },
              { icon: AlertCircle, color: "text-amber-500", text: "Don't use PoliPulse for illegal activities." },
              { icon: CheckCircle, color: "text-emerald-500", text: "Cancel your account at any time, no questions asked." },
              { icon: XCircle, color: "text-red-500", text: "Accounts used for fraud will be terminated immediately." },
              { icon: CheckCircle, color: "text-emerald-500", text: "We will notify you of any material changes to these terms." },
            ].map(({ icon: Icon, color, text }, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm font-medium ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                <Icon size={16} className={`${color} flex-shrink-0`} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📚 Full Terms Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-6">

        <Section icon={FileText} title="1. Acceptance of Terms" isDark={isDark}>
          <p>By accessing or using PoliPulse ("the Service"), you confirm that you are at least <Highlight isDark={isDark}>18 years of age</Highlight>, have read and understood these Terms of Service, and agree to be legally bound by them.</p>
          <p>If you are using PoliPulse on behalf of an organization, you represent that you have the authority to bind that organization to these terms.</p>
          <p>If you do not agree to these terms, please discontinue use of the Service immediately.</p>
        </Section>

        <Section icon={Briefcase} title="2. License & Permitted Use" isDark={isDark}>
          <p>Subject to your compliance with these Terms, PoliPulse grants you a <Highlight isDark={isDark}>limited, non-exclusive, non-transferable license</Highlight> to access and use the Service for your personal or business insurance portfolio management.</p>
          <div className="space-y-3 mt-4">
            <Clause title="✅ You May:" isDark={isDark}>
              Store, view, and manage your own insurance policy records; export your data; and share access within your organization.
            </Clause>
            <Clause title="❌ You May Not:" isDark={isDark}>
              Reverse engineer, resell, or sublicense the platform; scrape data without written permission; use the platform to store data on behalf of other organizations without a commercial agreement; or attempt to bypass security controls.
            </Clause>
          </div>
        </Section>

        <Section icon={CheckCircle} title="3. Accounts & Subscriptions" isDark={isDark}>
          <p>You are responsible for maintaining the confidentiality of your account credentials. All activity under your account is your responsibility.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              { plan: "Free Plan", desc: "Access to core policy management features for individual users. No credit card required." },
              { plan: "Premium Plan", desc: "Advanced analytics, unlimited policies, and priority support at ₹999/month." },
            ].map(({ plan, desc }, i) => (
              <div key={i} className={`p-5 rounded-2xl border ${i === 1 ? (isDark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200") : (isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200")}`}>
                <div className={`font-black mb-2 ${i === 1 ? "text-amber-500" : (isDark ? "text-white" : "text-slate-900")}`}>{plan}</div>
                <div>{desc}</div>
              </div>
            ))}
          </div>
          <p className="mt-4">Subscriptions auto-renew monthly unless cancelled before the billing cycle ends. Refunds for paid months are provided at our discretion for exceptional circumstances.</p>
        </Section>

        <Section icon={AlertCircle} title="4. Prohibited Conduct" isDark={isDark}>
          <p>The following activities are expressly prohibited and will result in immediate account termination:</p>
          <ul className="space-y-2 mt-3">
            {[
              "Submitting false, misleading, or fraudulent insurance data to manipulate analytics.",
              "Using the platform to plan, facilitate, or conceal insurance fraud.",
              "Attempting unauthorized access to other users' data or the platform infrastructure.",
              "Uploading malicious code, malware, or any software designed to compromise the platform.",
              "Violating any applicable local, state, national, or international law or regulation.",
              "Impersonating any person, company, or entity when using the platform.",
            ].map((item, i) => (
              <li key={i} className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? "bg-red-500/5 border border-red-500/10" : "bg-red-50 border border-red-100"}`}>
                <span className="text-red-500 font-black flex-shrink-0 mt-0.5">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={Scale} title="5. Intellectual Property" isDark={isDark}>
          <p><Highlight isDark={isDark}>Your data belongs to you.</Highlight> All policy records, client information, and business data you enter into PoliPulse remain your property. We claim no ownership over your data.</p>
          <p>The PoliPulse platform, including its design, code, branding, and all associated intellectual property, remains the exclusive property of PoliPulse Systems Inc. You may not copy, modify, distribute, or create derivative works of our platform without express written permission.</p>
        </Section>

        <Section icon={AlertCircle} title="6. Disclaimers & Limitation of Liability" isDark={isDark}>
          <p>PoliPulse is provided <Highlight isDark={isDark}>"as is"</Highlight> without warranties of any kind. While we strive for 99.9% uptime, we do not warrant that the service will be uninterrupted or error-free.</p>
          <p>We are not insurance advisors. Data stored in PoliPulse is for management purposes only and does not constitute financial, legal, or insurance advice. Always consult a licensed insurance professional for specialized guidance.</p>
          <p>To the maximum extent permitted by law, PoliPulse's aggregate liability for any claims arising from your use of the service shall not exceed the total fees you have paid to us in the 12 months preceding the claim.</p>
        </Section>

        <Section icon={RefreshCw} title="7. Changes to Terms" isDark={isDark}>
          <p>We reserve the right to modify these Terms at any time. When we make material changes, we will:</p>
          <ul className="space-y-2 mt-3">
            {[
              "Update the 'Last Updated' date at the top of this page.",
              "Send a notification email to your registered account address.",
              "Display a prominent in-app banner for at least 7 days.",
            ].map((item, i) => (
              <li key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">Continued use of the platform after the effective date of changes constitutes your acceptance of the revised terms.</p>
        </Section>

        <Section icon={Mail} title="8. Contact & Disputes" isDark={isDark}>
          <p>For any questions about these Terms, please contact our legal team:</p>
          <div className={`mt-4 p-6 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"}`}>
            <div className={`font-black mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>PoliPulse Legal Team</div>
            <a href="mailto:legal@polipulse.com" className="text-purple-500 hover:text-purple-400 font-bold transition-colors">legal@polipulse.com</a>
            <p className="mt-2 text-xs opacity-60">These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Mumbai, Maharashtra.</p>
          </div>
        </Section>

        {/* Back Link */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
          <Link to="/" className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isDark ? "bg-white/5 text-white hover:bg-white/10 border border-white/5" : "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200"}`}>
            ← Back to Home
          </Link>
          <Link to="/privacy" className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-purple-600 text-white hover:bg-purple-700 shadow-xl shadow-purple-600/20 transition-all">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
