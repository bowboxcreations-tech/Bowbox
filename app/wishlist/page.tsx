"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    async function getWishlist() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const { data, error } = await supabase
        .from("wishlist")
        .select(`products (*)`)
        .eq("user_id", user.id);

      if (data) {
        setItems(data.map((entry: any) => entry.products));
      }
      setLoading(false);
    }
    getWishlist();
  }, []);

  const removeFromWishlist = async (productId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("You must be logged in to manage your wishlist!"); return; }

      setRemovingId(productId);
      await new Promise((r) => setTimeout(r, 300)); // let exit animation play

      const { error } = await supabase
        .from("wishlist").delete()
        .eq("user_id", user.id).eq("product_id", productId);

      if (error) throw error;
      setItems((prev) => prev.filter((item) => item.id !== productId));
      setRemovingId(null);
    } catch (error: any) {
      alert("Error removing item: " + error.message);
      setRemovingId(null);
    }
  };

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ background: "linear-gradient(160deg, #fdf4ff 0%, #fff0f6 55%, #fff7f0 100%)" }}
    >
      {/* ── Fixed ambient blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { color: "#FF52A0", x: "78%", y: "6%",  size: 360 },
          { color: "#8100D1", x: "-5%", y: "52%", size: 280 },
          { color: "#FFA47F", x: "52%", y: "80%", size: 220 },
        ].map((b, i) => (
          <motion.div key={i}
            className="absolute rounded-full blur-3xl opacity-[0.07]"
            style={{ background: b.color, width: b.size, height: b.size, left: b.x, top: b.y }}
            animate={{ scale: [1, 1.18, 1], x: [0, 20, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-black uppercase tracking-widest mb-2"
                style={{ color: "#FF52A0" }}
              >
                ✦ your collection
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-4xl font-black tracking-tight"
                style={{ color: "#8100D1", fontFamily: "Georgia, serif" }}
              >
                My Saved Items
              </motion.h1>
            </div>

            {/* Live count badge */}
            <AnimatePresence mode="wait">
              {!loading && items.length > 0 && (
                <motion.div
                  key={items.length}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border self-start sm:self-auto"
                  style={{ background: "#fdf4ff", borderColor: "rgba(129,0,209,0.15)" }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="text-base"
                  >
                    ❤️
                  </motion.span>
                  <span className="font-black text-sm" style={{ color: "#8100D1" }}>
                    {items.length} {items.length === 1 ? "item" : "items"} saved
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 gap-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4 border-[#8100D1]/20 border-t-[#8100D1]"
            />
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="text-sm font-black uppercase tracking-widest"
              style={{ color: "#8100D1" }}
            >
              Loading your favorites...
            </motion.p>
          </div>

        ) : items.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-28 rounded-3xl border-2 border-dashed border-[#FF52A0]/15 bg-white/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, -12, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-5"
            >
              🤍
            </motion.div>
            <h3 className="text-2xl font-black mb-2" style={{ color: "#8100D1" }}>
              Your wishlist is empty!
            </h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">
              Save the pieces you love and find them here later.
            </p>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="text-white px-10 py-3.5 rounded-full font-black text-sm shadow-xl"
                style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
              >
                ✦ Start Saving Favourites
              </motion.button>
            </Link>
          </motion.div>

        ) : (
          /* ── Wishlist Grid ── */
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {items.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={
                    removingId === product.id
                      ? { opacity: 0, scale: 0.88, y: -12 }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.32, delay: removingId ? 0 : i * 0.06 }}
                  whileHover={{ y: -7, scale: 1.015 }}
                  className="group flex flex-col bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-white"
                  style={{ boxShadow: "0 2px 20px rgba(129,0,209,0.07)" }}
                >
                  {/* Image */}
                  <Link href={`/product/${product.id}`}>
                    <div className="relative overflow-hidden aspect-square">
                      <motion.img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                      />

                      {/* Hover overlay */}
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: "rgba(129,0,209,0.12)" }}
                      >
                        <span className="bg-white text-[#8100D1] text-[11px] font-black px-4 py-2 rounded-full shadow-lg">
                          View Details →
                        </span>
                      </div>

                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ background: "linear-gradient(180deg, #FF52A0, #8100D1)" }}
                      />

                      {/* Heart badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.06 + 0.2, type: "spring", stiffness: 260 }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-sm bg-white"
                      >
                        ❤️
                      </motion.div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col flex-1 p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-black text-gray-800 text-sm leading-snug mb-1 line-clamp-2 hover:text-[#8100D1] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="font-black text-base mb-4 mt-auto" style={{ color: "#FF52A0" }}>
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    {/* Action row */}
                    <div className="flex gap-2">
                      <Link href={`/product/${product.id}`} className="flex-1">
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                          className="w-full py-2.5 rounded-xl font-black text-xs text-white shadow-md relative overflow-hidden"
                          style={{ background: "linear-gradient(135deg, #8100D1, #B500B2)" }}
                        >
                          {/* shimmer */}
                          <motion.span
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.16) 50%, transparent 62%)" }}
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                          />
                          View Item
                        </motion.button>
                      </Link>

                      <motion.button
                        onClick={() => removeFromWishlist(product.id)}
                        disabled={removingId === product.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.88 }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all flex-shrink-0 disabled:opacity-40"
                        style={{ background: "#fff0f0", border: "1.5px solid rgba(239,68,68,0.15)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#fff0f0"; }}
                      >
                        🗑️
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Bottom CTA ── */}
        {!loading && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-14"
          >
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-8 py-3 rounded-full font-black text-sm border-2 bg-white/60 transition-all"
                style={{ color: "#8100D1", borderColor: "rgba(129,0,209,0.25)" }}
              >
                ✦ Discover More
              </motion.button>
            </Link>
          </motion.div>
        )}

      </div>
    </div>
  );
}