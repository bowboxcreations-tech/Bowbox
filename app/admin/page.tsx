"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  // --- 1. ADMIN AUTH STATE ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  const ADMIN_ACCOUNTS = [
    { email: "debmalyabhattacharyya2@gmail.com", password: "BOWBOX_ADMIN_2026" },
    { email: "rumpisaha755@gmail.com", password: "i like debu's dick" },
  ];

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const authorized = ADMIN_ACCOUNTS.find(
      (acc) => acc.email === adminEmail && acc.password === adminPassword
    );
    if (authorized) {
      setIsAdminLoggedIn(true);
      setLoginError(false);
      fetchInventory();
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  // --- 2. INVENTORY ---
  const [products, setProducts] = useState<any[]>([]);

  async function fetchInventory() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Delete this item forever?")) return;
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (!error) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

  // --- 3. GOOGLE DRIVE CONVERTER ---
  const convertToDirectLink = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      const fileIdMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://lh3.googleusercontent.com/u/0/d/${fileIdMatch[1]}`;
      }
    }
    return url;
  };

  // --- 4. UPLOAD STATES ---
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Jewellery");
  const [occasion, setOccasion] = useState("Birthday");
  const [prodUploadType, setProdUploadType] = useState<"file" | "link">("file");
  const [prodFile, setProdFile] = useState<File | null>(null);
  const [prodUrl, setProdUrl] = useState("");

  const [testimonialName, setTestimonialName] = useState("");
  const [testUploadType, setTestUploadType] = useState<"file" | "link">("file");
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testUrl, setTestUrl] = useState("");

  const getFinalImageUrl = async (
    type: "file" | "link",
    selectedFile: File | null,
    pastedUrl: string,
    bucket: string
  ) => {
    if (type === "link") {
      if (!pastedUrl) throw new Error("Please paste an image link!");
      return convertToDirectLink(pastedUrl);
    }
    if (!selectedFile) throw new Error("Please select an image file!");
    const fileName = `${Date.now()}_${selectedFile.name.replace(/\s/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, selectedFile);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  };

  // --- 5. SUBMIT HANDLERS ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const finalUrl = await getFinalImageUrl(prodUploadType, prodFile, prodUrl, "product-images");
      const { error } = await supabase.from("products").insert([{
        name, price: parseFloat(price), description, main_category: category, occasion, image_url: finalUrl,
      }]);
      if (error) throw error;
      alert("Product successfully added! ✨");
      fetchInventory();
      setName(""); setPrice(""); setDescription(""); setProdFile(null); setProdUrl("");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const finalUrl = await getFinalImageUrl(testUploadType, testFile, testUrl, "testimonial-images");
      const { error } = await supabase.from("testimonials").insert([{
        customer_name: testimonialName || "Happy Customer", image_url: finalUrl,
      }]);
      if (error) throw error;
      alert("Testimonial added! ✨");
      setTestimonialName(""); setTestFile(null); setTestUrl("");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ===================== LOGIN SCREEN =====================
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0015 0%, #1a0030 40%, #2d0050 100%)" }}>

        {/* Animated background orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: `${200 + i * 80}px`, height: `${200 + i * 80}px`,
              background: i % 2 === 0 ? "#FF52A0" : "#8100D1",
              left: `${10 + i * 18}%`, top: `${5 + i * 15}%`,
            }}
            animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md mx-6"
        >
          {/* Glowing card */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl blur-xl opacity-40"
              style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }} />
            <div className="relative rounded-3xl p-[1px]"
              style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1, #FF52A0)" }}>
              <div className="bg-[#0f0015] rounded-3xl p-10">

                {/* Logo mark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-black text-white"
                  style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
                >
                  BB
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-black text-center text-white mb-1 tracking-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Command Centre
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-sm mb-8 font-medium"
                  style={{ color: "#FF52A0" }}
                >
                  BOWBOX ADMIN — RESTRICTED ACCESS
                </motion.p>

                <motion.form
                  onSubmit={handleAdminLogin}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                >
                  <div className="relative">
                    <input
                      type="email" placeholder="Admin Email"
                      className="w-full p-4 rounded-xl text-white text-sm outline-none transition-all placeholder-gray-500 border border-white/10 focus:border-[#FF52A0]"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password" placeholder="Password"
                      className="w-full p-4 rounded-xl text-white text-sm outline-none transition-all placeholder-gray-500 border border-white/10 focus:border-[#FF52A0]"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>

                  <AnimatePresence>
                    {loginError && (
                      <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-xs text-center font-bold"
                      >
                        ✕ Invalid credentials. Try again.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-xl font-black text-white text-base shadow-2xl transition-all mt-2"
                    style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
                  >
                    Unlock Dashboard →
                  </motion.button>
                </motion.form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===================== DASHBOARD =====================
  return (
    <div className="min-h-screen font-sans" style={{ background: "#f7f3ff" }}>

      {/* TOP NAV */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/60 backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.85)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}>BB</div>
            <div>
              <h1 className="text-lg font-black tracking-tight" style={{ color: "#8100D1" }}>BOWBOX COMMAND</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-0.5">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 font-bold">{products.length} Products Live</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setIsAdminLoggedIn(false)}
              className="bg-red-50 text-red-500 px-5 py-2 rounded-full font-bold text-xs border border-red-100 hover:bg-red-500 hover:text-white transition-all"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* STAT CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Products", value: products.length, color: "#8100D1", bg: "#f3e8ff" },
            { label: "Jewellery", value: products.filter(p => p.main_category === "Jewellery").length, color: "#FF52A0", bg: "#fff0f6" },
            { label: "Bouquets", value: products.filter(p => p.main_category === "Bouquets").length, color: "#FFA47F", bg: "#fff7f0" },
            { label: "Other Items", value: products.filter(p => !["Jewellery","Bouquets"].includes(p.main_category)).length, color: "#B500B2", bg: "#fce8fc" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-2xl p-5 border border-white shadow-sm"
              style={{ background: stat.bg }}
            >
              <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT COLUMN — Forms */}
          <div className="lg:col-span-2 space-y-8">

            {/* PRODUCT UPLOAD CARD */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Card header strip */}
              <div className="px-7 py-5 border-b border-gray-50 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg, #fff0f6, #f3e8ff)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}>📦</div>
                <h2 className="text-base font-black tracking-tight" style={{ color: "#8100D1" }}>Upload New Product</h2>
              </div>

              <div className="p-7">
                {/* Toggle */}
                <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl">
                  {(["file", "link"] as const).map((t) => (
                    <motion.button
                      key={t}
                      type="button"
                      onClick={() => setProdUploadType(t)}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-2 rounded-lg text-xs font-black transition-all"
                      style={{
                        background: prodUploadType === t ? "white" : "transparent",
                        color: prodUploadType === t ? "#FF52A0" : "#9ca3af",
                        boxShadow: prodUploadType === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      {t === "file" ? "📁 Local File" : "🔗 Drive Link"}
                    </motion.button>
                  ))}
                </div>

                <form onSubmit={handleProductSubmit} className="space-y-3">
                  <AnimatePresence mode="wait">
                    {prodUploadType === "file" ? (
                      <motion.div
                        key="prod-file"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="border-2 border-dashed border-[#FF52A0]/30 bg-[#fff0f6] p-5 rounded-2xl text-center cursor-pointer hover:border-[#FF52A0]/60 transition-all"
                      >
                        <p className="text-xs text-gray-400 font-bold mb-2">DROP IMAGE OR</p>
                        <input type="file" accept="image/*" onChange={(e) => setProdFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="prod-link"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="space-y-2"
                      >
                        <input
                          type="text" placeholder="Paste Google Drive link..."
                          value={prodUrl} onChange={(e) => setProdUrl(e.target.value)}
                          className="w-full border border-gray-100 bg-gray-50 p-3 rounded-xl text-sm focus:border-[#FF52A0] outline-none transition-all"
                        />
                        <AnimatePresence>
                          {prodUrl && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                              className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center"
                            >
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Preview</p>
                              <img
                                src={convertToDirectLink(prodUrl)}
                                className="h-20 w-20 object-cover rounded-xl mx-auto border-2 border-[#FF52A0]/40 shadow-sm"
                                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=Invalid")}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)}
                      className="border border-gray-100 bg-gray-50 p-3 rounded-xl text-sm focus:border-[#FF52A0] outline-none transition-all" />
                    <input type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)}
                      className="border border-gray-100 bg-gray-50 p-3 rounded-xl text-sm focus:border-[#FF52A0] outline-none transition-all" />
                  </div>

                  <textarea
                    placeholder="Description (materials, size, story...)"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-100 bg-gray-50 p-3 rounded-xl text-sm focus:border-[#FF52A0] outline-none transition-all h-24 resize-none"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="border border-gray-100 bg-gray-50 p-3 rounded-xl text-sm outline-none focus:border-[#FF52A0] transition-all">
                      {["Jewellery","Male","Female","Bouquets","Candle"].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <select value={occasion} onChange={(e) => setOccasion(e.target.value)}
                      className="border border-gray-100 bg-gray-50 p-3 rounded-xl text-sm outline-none focus:border-[#FF52A0] transition-all">
                      {["Birthday","Anniversary","Christmas","Celebrations"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    disabled={isUploading}
                    className="w-full py-3.5 rounded-xl font-black text-white text-sm shadow-lg transition-all disabled:opacity-50"
                    style={{ background: isUploading ? "#ccc" : "linear-gradient(135deg, #FF52A0, #8100D1)" }}
                  >
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Syncing...
                      </span>
                    ) : "✦ Add Product to Website"}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* TESTIMONIAL CARD */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="px-7 py-5 border-b border-gray-50 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg, #f3e8ff, #fce8fc)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #8100D1, #B500B2)" }}>💬</div>
                <h2 className="text-base font-black tracking-tight" style={{ color: "#8100D1" }}>Add Customer Review</h2>
              </div>

              <div className="p-7">
                <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl">
                  {(["file", "link"] as const).map((t) => (
                    <motion.button
                      key={t} type="button" onClick={() => setTestUploadType(t)} whileTap={{ scale: 0.97 }}
                      className="flex-1 py-2 rounded-lg text-xs font-black transition-all"
                      style={{
                        background: testUploadType === t ? "white" : "transparent",
                        color: testUploadType === t ? "#8100D1" : "#9ca3af",
                        boxShadow: testUploadType === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      {t === "file" ? "📁 File" : "🔗 Link"}
                    </motion.button>
                  ))}
                </div>

                <form onSubmit={handleTestimonialSubmit} className="space-y-3">
                  <AnimatePresence mode="wait">
                    {testUploadType === "file" ? (
                      <motion.div key="test-file"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="border-2 border-dashed border-[#8100D1]/20 bg-[#f3e8ff] p-5 rounded-2xl"
                      >
                        <input type="file" accept="image/*" onChange={(e) => setTestFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500" />
                      </motion.div>
                    ) : (
                      <motion.input key="test-link"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        type="text" placeholder="Review image URL..."
                        value={testUrl} onChange={(e) => setTestUrl(e.target.value)}
                        className="w-full border border-gray-100 bg-gray-50 p-3 rounded-xl text-sm focus:border-[#8100D1] outline-none transition-all"
                      />
                    )}
                  </AnimatePresence>

                  <input type="text" placeholder="Customer Name (optional)" value={testimonialName}
                    onChange={(e) => setTestimonialName(e.target.value)}
                    className="w-full border border-gray-100 bg-gray-50 p-3 rounded-xl text-sm focus:border-[#8100D1] outline-none transition-all"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    disabled={isUploading}
                    className="w-full py-3.5 rounded-xl font-black text-white text-sm shadow-lg disabled:opacity-50 transition-all"
                    style={{ background: isUploading ? "#ccc" : "linear-gradient(135deg, #8100D1, #B500B2)" }}
                  >
                    {isUploading ? "Processing..." : "✦ Add Review to Website"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN — Inventory */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #fff7f0, #fff0f6)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #FFA47F, #FF52A0)" }}>📋</div>
                <h2 className="text-base font-black tracking-tight" style={{ color: "#FFA47F" }}>Live Inventory</h2>
              </div>
              <span className="bg-[#FFA47F]/10 text-[#FFA47F] text-xs font-black px-3 py-1 rounded-full border border-[#FFA47F]/20">
                {products.length} items
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[760px]"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#e9d5ff transparent" }}>
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-5xl mb-4">📦</motion.div>
                  <p className="text-gray-300 font-black uppercase tracking-widest text-xs">No products yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  {products.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 group transition-all"
                      style={{ background: "linear-gradient(135deg, #fafafa, #f7f3ff)" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border-2 border-white">
                          <img src={p.image_url} className="h-full w-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="font-black text-sm leading-tight mb-0.5" style={{ color: "#8100D1" }}>{p.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full"
                              style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}>
                              ₹{p.price}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{p.main_category}</span>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteProduct(p.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm text-sm"
                      >
                        🗑️
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}