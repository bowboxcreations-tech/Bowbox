"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../utils/supabase";
import Link from "next/link";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const occasionFilter = searchParams.get("occasion");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase.from("products").select("*");
      if (categoryFilter) query = query.eq("main_category", categoryFilter);
      if (occasionFilter) query = query.eq("occasion", occasionFilter);
      const { data, error } = await query;
      if (data) setProducts(data);
      if (error) console.error("Error fetching filtered products:", error);
      setLoading(false);
    }
    fetchProducts();
  }, [categoryFilter, occasionFilter]);

  const handleBuyNow = (name: string, price: number, imageUrl: string) => {
    const phoneNumber = "916290785398";
    const message = `Hey Bowbox! I want to know more about: ${name}\nPrice: ₹${price}\nLink: ${imageUrl}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const addToCart = async (productId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login to add items to your cart! 🛒");

    const { error } = await supabase
      .from("cart")
      .insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);

    if (error) {
      alert("Error adding to cart.");
    } else {
      setAddedIds((prev) => new Set([...prev, productId]));
      setTimeout(() => setAddedIds((prev) => { const n = new Set(prev); n.delete(productId); return n; }), 2000);
    }
  };

  const getPageTitle = () => {
    if (categoryFilter) return `${categoryFilter} Collection`;
    if (occasionFilter) return `${occasionFilter} Special Gifts`;
    return "Our Entire Collection";
  };

  const activeFilter = categoryFilter || occasionFilter;

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ background: "linear-gradient(160deg, #fdf4ff 0%, #fff0f6 55%, #fff7f0 100%)" }}
    >
      {/* ── Fixed ambient blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { color: "#FF52A0", x: "80%", y: "8%",  size: 380 },
          { color: "#8100D1", x: "-4%", y: "50%", size: 300 },
          { color: "#FFA47F", x: "55%", y: "82%", size: 240 },
        ].map((b, i) => (
          <motion.div key={i}
            className="absolute rounded-full blur-3xl opacity-[0.07]"
            style={{ background: b.color, width: b.size, height: b.size, left: b.x, top: b.y }}
            animate={{ scale: [1, 1.18, 1], x: [0, 22, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12"
        >
          <Link href="/">
            <motion.span
              whileHover={{ x: -4 }}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-black px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-[#FF52A0]/20"
              style={{ color: "#FF52A0" }}
            >
              ← Back to Home
            </motion.span>
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black text-center tracking-tight mb-2"
            style={{ color: "#8100D1", fontFamily: "Georgia, serif" }}
          >
            {getPageTitle()}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ color: "#FF52A0" }}
          >
            ✦ handcrafted with love ✦
          </motion.p>

          {/* Active filter pill */}
          <AnimatePresence>
            {activeFilter && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Link href="/shop">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full border-2 transition-all"
                    style={{ background: "#fdf4ff", color: "#8100D1", borderColor: "rgba(129,0,209,0.2)" }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#FF52A0]" />
                    {activeFilter}
                    <span className="text-gray-400 ml-1">× Clear</span>
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product count */}
          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-gray-400 font-bold mt-3 uppercase tracking-widest"
            >
              {products.length} {products.length === 1 ? "product" : "products"} found
            </motion.p>
          )}
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
              Finding the perfect gifts...
            </motion.p>
          </div>

        ) : products.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-28 rounded-3xl border-2 border-dashed border-[#8100D1]/15 bg-white/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-5"
            >
              🎁
            </motion.div>
            <h3 className="text-2xl font-black mb-2" style={{ color: "#8100D1" }}>No items found!</h3>
            <p className="text-gray-400 text-sm mb-8">Try browsing our full collection instead.</p>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="text-white px-10 py-3.5 rounded-full font-black text-sm shadow-xl"
                style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
              >
                ✦ View All Products
              </motion.button>
            </Link>
          </motion.div>

        ) : (
          /* ── Product Grid ── */
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 28, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.93 }}
                  transition={{ delay: i * 0.055, duration: 0.35 }}
                  whileHover={{ y: -8, scale: 1.015 }}
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
                      {/* Overlay on hover */}
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: "rgba(129,0,209,0.12)" }}
                      >
                        <motion.span
                          initial={{ y: 8, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          className="bg-white text-[#8100D1] text-[11px] font-black px-4 py-2 rounded-full shadow-lg"
                        >
                          View Details →
                        </motion.span>
                      </div>

                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ background: "linear-gradient(180deg, #FF52A0, #8100D1)" }}
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col flex-1 p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-black text-gray-800 text-sm leading-snug line-clamp-2 mb-1 hover:text-[#8100D1] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {product.occasion && (
                      <span
                        className="text-[10px] font-black uppercase tracking-wider mb-2 px-2 py-0.5 rounded-full self-start"
                        style={{ background: "#fdf4ff", color: "#8100D1" }}
                      >
                        {product.occasion}
                      </span>
                    )}

                    <AnimatePresence mode="wait">
                      <motion.p
                        key={product.price}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-black text-lg mt-auto mb-3"
                        style={{ color: "#FF52A0" }}
                      >
                        {formatPrice(product.price)}
                      </motion.p>
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => addToCart(product.id)}
                        whileTap={{ scale: 0.93 }}
                        className="flex-1 py-2.5 rounded-xl font-black text-xs relative overflow-hidden transition-all"
                        style={{
                          background: addedIds.has(product.id)
                            ? "linear-gradient(135deg, #22c55e, #16a34a)"
                            : "#fdf4ff",
                          color: addedIds.has(product.id) ? "white" : "#8100D1",
                          border: `1.5px solid ${addedIds.has(product.id) ? "transparent" : "rgba(129,0,209,0.2)"}`,
                        }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={addedIds.has(product.id) ? "added" : "add"}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.16 }}
                          >
                            {addedIds.has(product.id) ? "✓ Added!" : "+ Cart"}
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>

                      <motion.button
                        onClick={() => handleBuyNow(product.name, product.price, product.image_url)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.93 }}
                        className="flex-1 py-2.5 rounded-xl font-black text-xs text-white shadow-md relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #8100D1, #B500B2)" }}
                      >
                        {/* shimmer */}
                        <motion.span
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.16) 50%, transparent 62%)" }}
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: i * 0.15 }}
                        />
                        Buy Now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4"
          style={{ background: "linear-gradient(160deg, #fdf4ff, #fff0f6)" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 rounded-full border-4 border-[#8100D1]/20 border-t-[#8100D1]"
          />
          <p className="text-sm font-black text-[#8100D1] uppercase tracking-widest">Loading Shop...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}