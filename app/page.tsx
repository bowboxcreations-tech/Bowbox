"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "../utils/supabase";
import Link from "next/link";

// ── Toast system ──────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning";
interface Toast { id: number; message: string; type: ToastType; }

let toastId = 0;

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  const styles: Record<ToastType, { bg: string; icon: string; border: string }> = {
    success: { bg: "linear-gradient(135deg,#22c55e,#16a34a)", icon: "✓", border: "rgba(34,197,94,0.4)"    },
    error:   { bg: "linear-gradient(135deg,#ef4444,#dc2626)", icon: "✕", border: "rgba(239,68,68,0.4)"    },
    info:    { bg: "linear-gradient(135deg,#8100D1,#B500B2)", icon: "ℹ", border: "rgba(129,0,209,0.4)"    },
    warning: { bg: "linear-gradient(135deg,#FF52A0,#e03d8a)", icon: "!",  border: "rgba(255,82,160,0.4)"  },
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const s = styles[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.88 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="pointer-events-auto relative flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl min-w-[260px] max-w-xs border overflow-hidden"
              style={{
                background: "rgba(15,0,21,0.92)",
                backdropFilter: "blur(12px)",
                borderColor: s.border,
              }}
            >
              {/* Coloured icon bubble */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg"
                style={{ background: s.bg }}
              >
                {s.icon}
              </div>

              <p className="text-white text-sm font-bold leading-snug flex-1">{t.message}</p>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => remove(t.id)}
                className="text-white/40 hover:text-white text-xs font-black transition-colors flex-shrink-0 ml-1"
              >
                ✕
              </motion.button>

              {/* Shrinking progress bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-[3px] rounded-full"
                style={{ background: s.bg }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3.5, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [wishedIds, setWishedIds] = useState<Set<number>>(new Set());

  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [specials, setSpecials] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3700);
  }, []);

  // ── Data fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      const { data: productData, error: productError } = await supabase.from("products").select("*");
      if (productData) {
        setNewArrivals(productData.filter((p) => p.is_new_arrival === true));
        setSpecials(productData.filter((p) => p.is_special === true));
        setBestSellers(productData.filter((p) => p.is_best_seller === true));
      }
      if (productError) console.error("Error fetching products:", productError);

      const { data: testimonialData, error: testimonialError } = await supabase.from("testimonials").select("*");
      if (testimonialData) setTestimonials(testimonialData);
      if (testimonialError) console.error("Error fetching testimonials:", testimonialError);

      setIsMounted(true);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleBuyNow = (productName: string, productPrice: number, imageUrl: string) => {
    const phoneNumber = "916290785398";
    const message = `Hey Bowbox! I want to know more about this item: ${productName}\nPrice: ₹${productPrice}\nImage Link: ${imageUrl}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const toggleWishlist = async (productId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Please log in to save items to your wishlist 🤍", "warning");
      return;
    }
    const { error } = await supabase.from("wishlist").insert([{ user_id: user.id, product_id: productId }]);
    if (error) {
      if (error.code === "23505") showToast("Already in your wishlist!", "info");
      else showToast("Error saving to wishlist: " + error.message, "error");
    } else {
      setWishedIds((prev) => new Set([...prev, productId]));
      setTimeout(() => setWishedIds((prev) => { const n = new Set(prev); n.delete(productId); return n; }), 2000);
      showToast("Saved to wishlist! ❤️", "success");
    }
  };

  const addToCart = async (productId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Please log in to add items to your cart 🛒", "warning");
      return;
    }
    const { error } = await supabase.from("cart").insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);
    if (error) { showToast("Error adding to cart: " + error.message, "error"); }
    else {
      setAddedIds((prev) => new Set([...prev, productId]));
      setTimeout(() => setAddedIds((prev) => { const n = new Set(prev); n.delete(productId); return n; }), 2000);
      showToast("Added to cart! 🛒", "success");
    }
  };

  // ── Variants ───────────────────────────────────────────────────────────────
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  // ── Product card renderer ──────────────────────────────────────────────────
  const renderProductCards = (products: any[], keyPrefix = "") => {
    if (products.length === 0) {
      return <div className="text-gray-400 italic p-4 font-bold text-sm">No items uploaded yet...</div>;
    }
    return products.map((product) => (
      <motion.div
        key={`${keyPrefix}${product.id}`}
        className="w-52 shrink-0 flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-white dark:border-gray-700 group"
        style={{ boxShadow: "0 2px 20px rgba(129,0,209,0.08)" }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
      >
        <Link href={`/product/${product.id}`}>
          <div className="relative overflow-hidden aspect-square">
            <motion.img
              src={product.image_url} alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }} transition={{ duration: 0.4 }}
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3"
              style={{ background: "linear-gradient(to top, rgba(129,0,209,0.3), transparent)" }}>
              <span className="bg-white text-[#8100D1] text-[10px] font-black px-3 py-1 rounded-full shadow">View →</span>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: "linear-gradient(180deg, #FF52A0, #8100D1)" }} />
          </div>
        </Link>

        <div className="p-3.5 flex flex-col flex-1">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-[#8100D1] dark:text-white text-xs leading-snug line-clamp-2 min-h-[32px] mb-1 hover:text-[#FF52A0] transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="font-black text-sm mb-3 mt-auto" style={{ color: "#FF52A0" }}>
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          <div className="flex gap-1.5 mb-1.5">
            {/* Cart button */}
            <motion.button
              onClick={() => addToCart(product.id)}
              whileTap={{ scale: 0.92 }}
              className="flex-1 py-2 rounded-xl font-black text-[10px] transition-all relative overflow-hidden"
              style={{
                background: addedIds.has(product.id) ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#fdf4ff",
                color: addedIds.has(product.id) ? "white" : "#8100D1",
                border: `1.5px solid ${addedIds.has(product.id) ? "transparent" : "rgba(129,0,209,0.18)"}`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span key={addedIds.has(product.id) ? "y" : "n"}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}>
                  {addedIds.has(product.id) ? "✓ Added" : "+ Cart"}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Wishlist button */}
            <motion.button
              onClick={() => toggleWishlist(product.id)}
              whileTap={{ scale: 0.88 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all flex-shrink-0 border"
              style={{
                background: wishedIds.has(product.id) ? "#FF52A0" : "#fff0f6",
                borderColor: "rgba(255,82,160,0.25)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span key={wishedIds.has(product.id) ? "f" : "e"}
                  initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}
                  transition={{ duration: 0.15 }}>
                  {wishedIds.has(product.id) ? "❤️" : "🤍"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Buy Now */}
          <motion.button
            onClick={() => handleBuyNow(product.name, product.price, product.image_url)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
            className="w-full py-2 rounded-xl font-black text-[10px] text-white relative overflow-hidden shadow-md"
            style={{ background: "linear-gradient(135deg, #8100D1, #B500B2)" }}
          >
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.15) 50%, transparent 62%)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
             Buy Now
          </motion.button>
        </div>
      </motion.div>
    ));
  };

  // ── Static data ────────────────────────────────────────────────────────────
  const categories = [
    { label: "Birthday",     href: "/shop?occasion=Birthday",     from: "#FF52A0", to: "#e03d8a" },
    { label: "Anniversary",  href: "/shop?occasion=Anniversary",  from: "#8100D1", to: "#B500B2" },
    { label: "Christmas",    href: "/shop?occasion=Christmas",    from: "#B500B2", to: "#8100D1" },
    { label: "Celebrations", href: "/shop?occasion=Celebrations", from: "#FFA47F", to: "#FF52A0" },
  ];

  const sections = [
    { title: "New Arrivals", data: newArrivals, accent: "#FF52A0", bg: "rgba(255,82,160,0.06)"  },
    { title: "Specials",     data: specials,    accent: "#B500B2", bg: "rgba(181,0,178,0.06)"   },
    { title: "Best Sellers", data: bestSellers, accent: "#8100D1", bg: "rgba(129,0,209,0.06)"   },
  ];

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 overflow-x-hidden">

      {/* Toast portal */}
      <ToastContainer toasts={toasts} remove={removeToast} />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { color: "#FF52A0", x: "78%", y: "3%",  size: 420 },
          { color: "#8100D1", x: "-6%", y: "45%", size: 320 },
          { color: "#FFA47F", x: "50%", y: "80%", size: 260 },
        ].map((b, i) => (
          <motion.div key={i}
            className="absolute rounded-full blur-3xl opacity-[0.06] dark:opacity-[0.04]"
            style={{ background: b.color, width: b.size, height: b.size, left: b.x, top: b.y }}
            animate={{ scale: [1, 1.2, 1], x: [0, 24, 0] }}
            transition={{ duration: 9 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ── TOP BAR ── */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 flex justify-between items-center px-6 py-3 backdrop-blur-md border-b border-white/20"
        style={{ background: "linear-gradient(135deg, #8100D1, #B500B2)" }}
      >
        <motion.button
          onClick={() => setIsDarkMode(!isDarkMode)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-1.5 rounded-full text-xs font-black border border-white/20 transition-all"
        >
          {isDarkMode ? "☀ Light" : "🌙 Dark"}
        </motion.button>

        <div className="flex items-center gap-2">
          {[
            { label: "My Account", href: "/auth",     icon: "👤" },
            { label: "Wishlist",   href: "/wishlist", icon: "❤️" },
            { label: "Cart",       href: "/cart",     icon: "🛒" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.button
                whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.94 }}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-4 py-1.5 rounded-full text-xs font-black border border-white/20 transition-all"
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </motion.button>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── HERO ── */}
      <motion.div
        className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-10 min-h-[480px] overflow-hidden border-b-4 border-[#FF52A0]/40"
        style={{ background: "linear-gradient(145deg, #fdf4ff 0%, #fff0f6 60%, #fff7f0 100%)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}
      >
        {isMounted && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={`bee-${i}`} className="absolute rounded-full"
                style={{ width: 10, height: 10, background: i % 2 === 0 ? "#FF52A0" : "#FFA47F",
                  left: `${10 + i * 11}%`, top: `${15 + (i % 4) * 18}%`, opacity: 0.35 }}
                animate={{ y: [0, -18, 0], x: [0, i % 2 === 0 ? 12 : -12, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }} />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div key={`lamp-${i}`} className="absolute rounded-full opacity-30"
                style={{ width: 6, height: 22, background: "#8100D1", left: `${8 + i * 20}%`, top: 0 }}
                animate={{ rotate: [-6, 6, -6], y: [0, 8, 0] }}
                transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }} />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div key={`spark-${i}`} className="absolute w-1.5 h-1.5 rounded-full opacity-50"
                style={{ background: "#B500B2", left: `${(i * 8.3) % 100}%`, top: `${(i * 13.7) % 100}%` }}
                animate={{ scale: [1, 0, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </>
        )}
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={`box-${i}`} className="absolute w-7 h-7 rounded-xl opacity-20"
            style={{ background: "#B500B2", right: "4%", top: `${18 + i * 20}%` }}
            animate={{ y: [0, -14, 0], rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }} />
        ))}

        <motion.img src="/logo-circle.jpg" alt="Bowbox Logo"
          className="w-44 h-44 md:w-56 md:h-56 object-contain relative z-10 drop-shadow-2xl"
          initial={{ x: -80, opacity: 0, scale: 0.9 }} animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }} whileHover={{ scale: 1.05, rotate: 3 }} />

        <div className="relative z-10 text-center md:text-left">
          <motion.img src="/logo-text.png" alt="Bowbox Text Logo"
            className="w-64 md:w-80 h-auto object-contain drop-shadow-xl mb-4"
            initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} />
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-sm font-black uppercase tracking-widest mb-5" style={{ color: "#FF52A0" }}>
            ✦ handcrafted gifts with love ✦
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <Link href="/shop">
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                className="text-white px-10 py-3.5 rounded-full font-black text-sm shadow-2xl relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}>
                <motion.span className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)" }}
                  animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
                Shop Collection →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="relative z-40 flex justify-center gap-4 px-6 py-4 border-b border-[#FF52A0]/10 backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.85)" }}
      >
        {[{ label: "Home", href: "/" }, { label: "Shop All", href: "/shop" }].map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.button whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
              className="font-black text-sm px-7 py-2.5 rounded-full text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #8100D1, #B500B2)" }}>
              {item.label}
            </motion.button>
          </Link>
        ))}

        <div className="relative">
          <motion.button onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
            className="font-black text-sm px-7 py-2.5 rounded-full border-2 flex items-center gap-2"
            style={{ color: "#8100D1", borderColor: "rgba(129,0,209,0.25)", background: "#fdf4ff" }}>
            Categories
            <motion.span animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>▾</motion.span>
          </motion.button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden w-44 border border-gray-100 z-50"
                style={{ boxShadow: "0 8px 40px rgba(129,0,209,0.15)" }}
              >
                {[
                  { label: "💍 Jewellery", href: "/shop?category=Jewellery" },
                  { label: "👔 Male",      href: "/shop?category=Male"      },
                  { label: "👗 Female",    href: "/shop?category=Female"    },
                  { label: "💐 Bouquets",  href: "/shop?category=Bouquets"  },
                  { label: "🕯 Candle",    href: "/shop?category=Candle"    },
                ].map((item, i) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                    <motion.button
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-full px-4 py-3 text-left text-sm font-black transition-all border-b border-gray-50 last:border-0"
                      style={{ color: "#8100D1" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(90deg,#8100D1,#B500B2)"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8100D1"; }}
                    >
                      {item.label}
                    </motion.button>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ── OCCASIONS ── */}
      <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="relative z-10 py-12 px-6 text-center"
        style={{ background: "linear-gradient(135deg, rgba(253,244,255,0.9), rgba(255,240,246,0.9))" }}>
        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#FF52A0" }}>✦ shop by moment</p>
        <h2 className="text-3xl font-black mb-8 tracking-tight" style={{ color: "#8100D1", fontFamily: "Georgia, serif" }}>
          What's the occasion?
        </h2>
        <div className="flex justify-center gap-3 flex-wrap">
          {categories.map((cat, i) => (
            <Link key={cat.label} href={cat.href}>
              <motion.button
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.07, y: -3 }} whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full font-black text-sm text-white shadow-xl relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}>
                <motion.span className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: i * 0.4 }} />
                {cat.label}
              </motion.button>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── PRODUCT SECTIONS ── */}
      <div className="relative z-10 py-4 space-y-10 px-6">
        {sections.map(({ title, data, accent, bg }) => (
          <motion.section key={title} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 rounded-full" style={{ background: accent }} />
              <h2 className="text-2xl font-black tracking-tight" style={{ color: "#8100D1", fontFamily: "Georgia, serif" }}>{title}</h2>
              <div className="flex-1 h-px ml-2" style={{ background: `${accent}22` }} />
              <Link href="/shop">
                <motion.span whileHover={{ x: 3 }} className="text-xs font-black uppercase tracking-wider" style={{ color: accent }}>
                  See all →
                </motion.span>
              </Link>
            </div>
            <div className="overflow-hidden rounded-3xl p-5 border border-white"
              style={{ background: bg, boxShadow: "0 2px 20px rgba(129,0,209,0.05)" }}>
              <div className={`flex ${data.length > 3 ? "animate-marquee" : ""} group hover:[animation-play-state:paused] whitespace-nowrap`}>
                <div className="flex gap-4 px-2">{renderProductCards(data)}</div>
                {data.length > 3 && (
                  <div className="flex gap-4 px-2" aria-hidden="true">{renderProductCards(data, "clone-")}</div>
                )}
              </div>
            </div>
          </motion.section>
        ))}

        {/* Testimonials */}
        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-7 rounded-full" style={{ background: "#FFA47F" }} />
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "#8100D1", fontFamily: "Georgia, serif" }}>
              What Customers Say
            </h2>
            <div className="flex-1 h-px ml-2" style={{ background: "rgba(255,164,127,0.2)" }} />
          </div>
          <div className="overflow-hidden rounded-3xl p-5 border border-white"
            style={{ background: "rgba(255,164,127,0.06)", boxShadow: "0 2px 20px rgba(129,0,209,0.05)" }}>
            <div className={`flex ${testimonials.length > 3 ? "animate-marquee" : ""} group hover:[animation-play-state:paused] whitespace-nowrap`}>
              <div className="flex gap-5 px-2">
                {testimonials.length === 0 ? (
                  <p className="text-gray-400 italic text-sm font-bold">No reviews yet...</p>
                ) : (
                  testimonials.map((t) => (
                    <motion.img key={t.id} src={t.image_url} alt="Review"
                      className="h-64 w-auto rounded-2xl shadow-md border-2 border-white flex-shrink-0"
                      whileHover={{ scale: 1.04, y: -4 }} transition={{ duration: 0.3 }} />
                  ))
                )}
              </div>
              {testimonials.length > 3 && (
                <div className="flex gap-5 px-2" aria-hidden="true">
                  {testimonials.map((t) => (
                    <img key={`clone-${t.id}`} src={t.image_url} alt="Review"
                      className="h-64 w-auto rounded-2xl shadow-md border-2 border-white flex-shrink-0" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="relative z-10 mt-16 py-8 text-center border-t border-[#FF52A0]/10"
        style={{ background: "linear-gradient(135deg, #8100D1, #B500B2)" }}>
        <p className="text-white/80 text-xs font-black uppercase tracking-widest">© 2026 BOWBOX — Handcrafted with ❤️</p>
      </motion.footer>

      {/* Floating gift */}
      <motion.div
        className="fixed bottom-8 left-8 w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-xl z-50 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.2 }}>
        🎁
      </motion.div>
    </main>
  );
}