"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    async function getProductAndRelated() {
      setLoading(true);
      setImageLoaded(false);
      const { data: mainProduct } = await supabase
        .from("products").select("*").eq("id", id).single();

      if (mainProduct) {
        setProduct(mainProduct);
        const { data: related } = await supabase
          .from("products").select("*")
          .eq("main_category", mainProduct.main_category)
          .neq("id", id).limit(4);
        if (related) setRelatedProducts(related);
      }
      setLoading(false);
    }
    getProductAndRelated();
  }, [id]);

  useEffect(() => {
    async function checkWishlist() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !id) return;
      const { data } = await supabase
        .from("wishlist").select("id")
        .eq("user_id", user.id).eq("product_id", id).single();
      if (data) setIsWishlisted(true);
    }
    checkWishlist();
  }, [id]);

  // --- WHATSAPP BUY NOW ---
  const handleBuyNow = () => {
    const phoneNumber = "916290785398";
    const message = `Hey Bowbox! I'm interested in: ${product.name}\nPrice: ₹${product.price}\nLink: ${product.image_url}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // --- ADD TO CART ---
  const addToCart = async () => {
    setCartLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Please log in to add items to your cart!"); return; }
      const { data: existingItem } = await supabase
        .from("cart").select("*")
        .eq("user_id", user.id).eq("product_id", product.id).single();
      if (existingItem) {
        const { error } = await supabase.from("cart")
          .update({ quantity: existingItem.quantity + 1 }).eq("id", existingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart")
          .insert([{ user_id: user.id, product_id: product.id, quantity: 1 }]);
        if (error) throw error;
      }
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2200);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setCartLoading(false);
    }
  };

  // --- TOGGLE WISHLIST ---
  const toggleWishlist = async () => {
    setWishlistLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Please log in to save items to your wishlist!"); return; }
      if (isWishlisted) {
        const { error } = await supabase.from("wishlist")
          .delete().eq("user_id", user.id).eq("product_id", product.id);
        if (error) throw error;
        setIsWishlisted(false);
      } else {
        const { error } = await supabase.from("wishlist")
          .insert([{ user_id: user.id, product_id: product.id }]);
        if (error) throw error;
        setIsWishlisted(true);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setWishlistLoading(false);
    }
  };

  // ── Loading screen ──
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: "linear-gradient(160deg, #fdf4ff, #fff0f6)" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 rounded-full border-4 border-[#8100D1]/20 border-t-[#8100D1]"
      />
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="font-black text-sm uppercase tracking-widest"
        style={{ color: "#8100D1" }}
      >
        Loading Bowbox Magic...
      </motion.p>
    </div>
  );

  if (!product) return (
    <div className="p-20 text-center text-gray-400 font-bold">Product not found.</div>
  );

  return (
    <div className="min-h-screen transition-colors"
      style={{ background: "linear-gradient(160deg, #fdf4ff 0%, #fff0f6 60%, #fff7f0 100%)" }}>

      {/* ── Fixed ambient blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { color: "#FF52A0", x: "75%", y: "5%",  size: 400 },
          { color: "#8100D1", x: "-5%", y: "55%", size: 300 },
          { color: "#FFA47F", x: "55%", y: "80%", size: 250 },
        ].map((b, i) => (
          <motion.div key={i}
            className="absolute rounded-full blur-3xl opacity-[0.07]"
            style={{ background: b.color, width: b.size, height: b.size, left: b.x, top: b.y }}
            animate={{ scale: [1, 1.15, 1], x: [0, 18, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* ── Back link ── */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/shop">
            <motion.span
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-1.5 text-sm font-black px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-[#FF52A0]/20 mb-8"
              style={{ color: "#FF52A0" }}
            >
              ← Back to Collection
            </motion.span>
          </Link>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">

          {/* RIGHT: IMAGE (shown first on mobile via order) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="sticky top-10 order-first lg:order-last"
          >
            {/* Glow behind image */}
            <div className="absolute inset-6 rounded-[3rem] blur-2xl opacity-20 pointer-events-none"
              style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }} />

            {/* Image with shimmer placeholder */}
            <div className="relative rounded-[3rem] overflow-hidden aspect-square shadow-2xl"
              style={{ border: "6px solid rgba(255,255,255,0.9)" }}>
              {!imageLoaded && (
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(135deg, #f3e8ff, #fff0f6)" }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                />
              )}
              <motion.img
                src={product.image_url}
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                initial={{ scale: 1.06 }}
                animate={{ scale: imageLoaded ? 1 : 1.06 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating category badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="absolute top-6 left-6 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-sm"
              style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
            >
              {product.main_category}
            </motion.div>
          </motion.div>

          {/* LEFT: TEXT DETAILS */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-7 order-last lg:order-first"
          >
            {/* Name */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-black uppercase tracking-widest mb-3"
                style={{ color: "#FF52A0" }}
              >
                ✦ {product.main_category}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="text-4xl lg:text-5xl font-black leading-tight tracking-tight"
                style={{ color: "#8100D1", fontFamily: "Georgia, serif" }}
              >
                {product.name}
              </motion.h1>
            </div>

            {/* Price tag */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.26 }}
              className="inline-flex items-baseline gap-1"
            >
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider">₹</span>
              <span className="text-5xl font-black" style={{ color: "#1a1a1a", fontFamily: "Georgia, serif" }}>
                {product.price.toLocaleString("en-IN")}
              </span>
            </motion.div>

            {/* Description card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
              className="rounded-2xl p-6 border"
              style={{ background: "rgba(255,255,255,0.7)", borderColor: "rgba(129,0,209,0.1)", backdropFilter: "blur(8px)" }}
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">About this piece</p>
              <p className="text-base text-gray-600 leading-relaxed">
                {product.description || "Every BOWBOX piece is crafted with love and care. This item is perfect for your special occasion."}
              </p>
            </motion.div>

            {/* Tags row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2"
            >
              {[product.main_category, product.occasion, "Handmade", "Gift Ready"].filter(Boolean).map((tag) => (
                <span key={tag}
                  className="text-[11px] font-black px-3 py-1.5 rounded-full border uppercase tracking-wide"
                  style={{ background: "#fdf4ff", color: "#8100D1", borderColor: "rgba(129,0,209,0.15)" }}
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46 }}
              className="flex flex-col gap-3 pt-2"
            >
              {/* Buy Now */}
              <motion.button
                onClick={handleBuyNow}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-5 rounded-2xl font-black text-white text-lg shadow-xl relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #8100D1, #B500B2)" }}
              >
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                />
                 Buy Now via WhatsApp →
              </motion.button>

              {/* Add to Cart + Wishlist */}
              <div className="flex gap-3">
                <motion.button
                  onClick={addToCart}
                  disabled={cartLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-4 rounded-xl font-black text-sm text-white shadow-md relative overflow-hidden disabled:opacity-60 transition-all"
                  style={{ background: cartSuccess ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #FF52A0, #e03d8a)" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={cartSuccess ? "done" : cartLoading ? "load" : "idle"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center justify-center gap-2"
                    >
                      {cartLoading ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.75, ease: "linear" }}
                            className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Adding...
                        </>
                      ) : cartSuccess ? "✓ Added to Cart!" : "🛒 Add to Cart"}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.93 }}
                  className="py-4 px-5 rounded-xl font-black text-sm border-2 transition-all disabled:opacity-60 relative"
                  style={{
                    background: isWishlisted ? "#8100D1" : "white",
                    color: isWishlisted ? "white" : "#8100D1",
                    borderColor: "#8100D1",
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isWishlisted ? "saved" : "save"}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {wishlistLoading ? "..." : isWishlisted ? "❤️" : "🤍"}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.58 }}
              className="flex gap-5 pt-2"
            >
            
            </motion.div>
          </motion.div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="pt-14"
            style={{ borderTop: "1px solid rgba(129,0,209,0.1)" }}
          >
            <div className="flex items-baseline gap-3 mb-8">
              <h2 className="text-3xl font-black" style={{ color: "#8100D1", fontFamily: "Georgia, serif" }}>
                More from {product.main_category}
              </h2>
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#FF52A0" }}>
                ✦ you may also love
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((item, i) => (
                <Link key={item.id} href={`/product/${item.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white shadow-sm group"
                    style={{ boxShadow: "0 2px 16px rgba(129,0,209,0.07)" }}
                  >
                    <div className="relative overflow-hidden aspect-square">
                      <motion.img
                        src={item.image_url}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                        alt={item.name}
                      />
                      {/* hover overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                        style={{ background: "rgba(129,0,209,0.12)" }}>
                        <span className="bg-white text-[#8100D1] text-[10px] font-black px-3 py-1.5 rounded-full shadow">
                          View →
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <h4 className="font-black text-sm text-gray-800 line-clamp-1 mb-1">{item.name}</h4>
                      <p className="font-black text-sm" style={{ color: "#FF52A0" }}>₹{item.price}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}