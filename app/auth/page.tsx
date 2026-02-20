"use client";
import { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      alert(isSignUp ? "Check your email for confirmation!" : "Welcome back!");
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-6"
      style={{ background: "linear-gradient(145deg, #1a0030 0%, #0f0015 50%, #1f0035 100%)" }}
    >
      {/* ── Animated background blobs ── */}
      {[
        { color: "#FF52A0", size: 340, x: "5%",  y: "10%", dur: 7 },
        { color: "#8100D1", size: 280, x: "70%", y: "5%",  dur: 9 },
        { color: "#B500B2", size: 220, x: "55%", y: "65%", dur: 6 },
        { color: "#FFA47F", size: 180, x: "15%", y: "70%", dur: 8 },
      ].map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ width: blob.size, height: blob.size, background: blob.color, left: blob.x, top: blob.y }}
          animate={{ scale: [1, 1.25, 1], x: [0, 25, 0], y: [0, -18, 0] }}
          transition={{ duration: blob.dur, repeat: Infinity, delay: i * 1.1, ease: "easeInOut" }}
        />
      ))}

      {/* ── Floating decorative gift icons ── */}
      {["🎀", "🌸", "✨", "💝", "🎁"].map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none opacity-20"
          style={{ left: `${8 + i * 20}%`, top: `${15 + (i % 3) * 25}%` }}
          animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay: i * 0.5 }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glow halo behind card */}
        <motion.div
          className="absolute inset-0 rounded-3xl blur-2xl opacity-30 pointer-events-none"
          style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
          animate={{ opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Gradient border wrapper */}
        <div className="relative rounded-3xl p-[1.5px]"
          style={{ background: "linear-gradient(135deg, #FF52A0 0%, #8100D1 50%, #FF52A0 100%)" }}>
          <div className="bg-[#100020] rounded-3xl overflow-hidden">

            {/* Top decorative band */}
            <div className="h-1.5 w-full"
              style={{ background: "linear-gradient(90deg, #FF52A0, #8100D1, #FFA47F, #FF52A0)", backgroundSize: "200% 100%" }} />

            <div className="px-10 py-10">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, delay: 0.15 }}
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-xl font-black text-white shadow-2xl"
                style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
              >
                BB
              </motion.div>

              {/* Animated heading swap */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? "signup-head" : "signin-head"}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.25 }}
                  className="text-center mb-8"
                >
                  <h2
                    className="text-3xl font-black text-white tracking-tight mb-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {isSignUp ? "Join BOWBOX" : "Welcome Back"}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FF52A0" }}>
                    {isSignUp ? "Create your account" : "Sign in to continue"}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="relative group"
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">✉</span>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all border placeholder-gray-600"
                    style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)" }}
                    onFocus={e => e.currentTarget.style.borderColor = "#FF52A0"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 }}
                  className="relative"
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">🔒</span>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all border placeholder-gray-600"
                    style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)" }}
                    onFocus={e => e.currentTarget.style.borderColor = "#FF52A0"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </motion.div>

                {/* Inline error */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-red-400 font-bold"
                    >
                      ✕ {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-xl font-black text-white text-sm shadow-2xl mt-1 disabled:opacity-60 transition-all relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
                  >
                    {/* shimmer effect */}
                    <motion.span
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)" }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    />
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.75, ease: "linear" }}
                          className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Processing...
                      </span>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isSignUp ? "create" : "signin"}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isSignUp ? "✦ Create Account" : "✦ Sign In"}
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Toggle sign-in / sign-up */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-gray-500"
              >
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <motion.button
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="font-black underline underline-offset-2 transition-colors"
                  style={{ color: "#FF52A0" }}
                >
                  {isSignUp ? "Sign In" : "Sign Up Free"}
                </motion.button>
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}