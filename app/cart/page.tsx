"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);

  useEffect(() => {
    async function getCart() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);
      const { data } = await supabase
        .from("cart")
        .select(`id, quantity, products (*)`)
        .eq("user_id", user.id);
      if (data) setCartItems(data);
      setLoading(false);
    }
    getCart();
  }, []);

  const removeFromCart = async (cartItemId: number) => {
    setRemovingId(cartItemId);
    await new Promise((r) => setTimeout(r, 320)); // let exit animation play
    const { error } = await supabase.from("cart").delete().eq("id", cartItemId);
    if (!error) setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    setRemovingId(null);
  };

  const updateQuantity = async (cartItemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      const confirmed = confirm("Remove this item from your cart?");
      if (confirmed) await removeFromCart(cartItemId);
      return;
    }
    const { error } = await supabase.from("cart").update({ quantity: newQty }).eq("id", cartItemId);
    if (!error) {
      setCartItems((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleCheckout = () => {
    const phoneNumber = "916290785398";
    const itemList = cartItems
      .map((item) => `- ${item.products.name} (Qty: ${item.quantity}) - ₹${item.products.price}\n  View: ${item.products.image_url}`)
      .join("\n\n");
    const totalAmount = cartItems.reduce((acc, item) => acc + item.products.price * item.quantity, 0);
    const message = `Hey Bowbox! I'd like to order:\n\n${itemList}\n\nTotal: ₹${totalAmount.toFixed(2)}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.products.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ background: "linear-gradient(160deg, #fdf4ff 0%, #fff0f6 50%, #fff7f0 100%)" }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[
          { color: "#FF52A0", x: "80%", y: "10%", size: 320 },
          { color: "#8100D1", x: "5%",  y: "60%", size: 260 },
          { color: "#FFA47F", x: "60%", y: "75%", size: 200 },
        ].map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl opacity-[0.07]"
            style={{ background: b.color, width: b.size, height: b.size, left: b.x, top: b.y }}
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
            transition={{ duration: 7 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-10"
        >
          <div>
            <h1
              className="text-4xl font-black tracking-tight"
              style={{ color: "#8100D1", fontFamily: "Georgia, serif" }}
            >
              Your Cart
            </h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={totalItems}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm font-bold mt-1"
                style={{ color: "#FF52A0" }}
              >
                {totalItems} {totalItems === 1 ? "item" : "items"} in your bag
              </motion.p>
            </AnimatePresence>
          </div>

          <Link href="/shop">
            <motion.span
              whileHover={{ x: -3 }}
              className="text-sm font-black flex items-center gap-1 px-4 py-2 rounded-full border-2 border-[#FF52A0]/30 bg-white/60 backdrop-blur-sm transition-all hover:bg-[#FF52A0] hover:text-white hover:border-[#FF52A0]"
              style={{ color: "#FF52A0" }}
            >
              ← Shop More
            </motion.span>
          </Link>
        </motion.div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 rounded-full border-4 border-[#8100D1]/20 border-t-[#8100D1]"
            />
            <p className="text-sm text-gray-400 font-bold">Loading your treasures...</p>
          </div>

        ) : cartItems.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-28 rounded-3xl border-2 border-dashed border-[#8100D1]/15 bg-white/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🛒
            </motion.div>
            <h3 className="text-2xl font-black mb-2" style={{ color: "#8100D1" }}>Your cart is empty!</h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">Time to find something beautiful 🌸</p>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="text-white px-10 py-3.5 rounded-full font-black text-sm shadow-xl"
                style={{ background: "linear-gradient(135deg, #FF52A0, #8100D1)" }}
              >
                ✦ Start Shopping
              </motion.button>
            </Link>
          </motion.div>

        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* ── Cart Items ── */}
            <div className="lg:col-span-3 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -30, scale: 0.97 }}
                    animate={removingId === item.id
                      ? { opacity: 0, x: 60, scale: 0.93 }
                      : { opacity: 1, x: 0, scale: 1 }
                    }
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white overflow-hidden"
                    style={{ boxShadow: "0 2px 20px rgba(129,0,209,0.06)" }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
                      style={{ background: "linear-gradient(180deg, #FF52A0, #8100D1)" }}
                    />

                    <div className="flex items-center gap-5 p-5 pl-6">
                      {/* Product image */}
                      <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0">
                        <img
                          src={item.products.image_url}
                          className="w-20 h-20 object-cover rounded-2xl shadow-md"
                          alt={item.products.name}
                          style={{ border: "2px solid rgba(255,82,160,0.2)" }}
                        />
                      </motion.div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-800 leading-tight truncate mb-1">{item.products.name}</h3>
                        <p className="text-sm font-black mb-0.5" style={{ color: "#FF52A0" }}>
                          ₹{item.products.price}
                          <span className="text-gray-300 font-normal"> / piece</span>
                        </p>
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={item.quantity}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-[11px] font-black uppercase tracking-wider"
                            style={{ color: "#8100D1" }}
                          >
                            Subtotal: {formatPrice(item.products.price * item.quantity)}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        {/* Qty pill */}
                        <div
                          className="flex items-center gap-1 rounded-2xl px-1.5 py-1.5 border"
                          style={{ background: "#fdf4ff", borderColor: "rgba(129,0,209,0.12)" }}
                        >
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.id, item.quantity, -1)}
                            className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-base transition-all"
                            style={{ color: "#8100D1", background: "white" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#8100D1"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#8100D1"; }}
                          >
                            −
                          </motion.button>
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.4, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.6, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className="w-7 text-center font-black text-sm"
                              style={{ color: "#8100D1" }}
                            >
                              {item.quantity}
                            </motion.span>
                          </AnimatePresence>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.id, item.quantity, +1)}
                            className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-base transition-all"
                            style={{ color: "#8100D1", background: "white" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#8100D1"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#8100D1"; }}
                          >
                            +
                          </motion.button>
                        </div>

                        {/* Remove */}
                        <motion.button
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] font-black px-3 py-1.5 rounded-full transition-all"
                          style={{ background: "#fff0f0", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "white"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#fff0f0"; e.currentTarget.style.color = "#ef4444"; }}
                        >
                          Remove ×
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Order Summary ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 sticky top-6"
            >
              <div
                className="rounded-3xl overflow-hidden"
                style={{ boxShadow: "0 8px 40px rgba(129,0,209,0.12)", border: "1px solid rgba(129,0,209,0.1)" }}
              >
                {/* Summary header */}
                <div
                  className="px-7 py-6"
                  style={{ background: "linear-gradient(135deg, #8100D1, #B500B2)" }}
                >
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Order Summary</p>
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={totalAmount}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-4xl font-black text-white"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {formatPrice(totalAmount)}
                    </motion.h2>
                  </AnimatePresence>
                  <p className="text-white/50 text-xs mt-1 font-medium">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
                </div>

                <div className="bg-white px-7 py-6 space-y-4">
                  {/* Line items */}
                  <div className="space-y-2.5">
                    {cartItems.map((item) => (
                      <motion.div layout key={item.id} className="flex justify-between text-xs">
                        <span className="text-gray-400 font-medium truncate max-w-[140px]">
                          {item.products.name}
                          <span className="text-gray-300"> ×{item.quantity}</span>
                        </span>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={item.quantity}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="font-black text-gray-700"
                          >
                            {formatPrice(item.products.price * item.quantity)}
                          </motion.span>
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-400">Shipping</span>
                    <span className="font-black text-green-500 text-xs">✓ Free</span>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-700">Total</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={totalAmount}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-black text-xl"
                        style={{ color: "#8100D1" }}
                      >
                        {formatPrice(totalAmount)}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  {/* Checkout button */}
                  <motion.button
                    onClick={handleCheckout}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl font-black text-white text-sm shadow-xl relative overflow-hidden mt-2"
                    style={{ background: "linear-gradient(135deg, #FF52A0, #B500B2)" }}
                  >
                    {/* shimmer sweep */}
                    <motion.span
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)" }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    />
                     Check Out !
                  </motion.button>

                  <p className="text-[10px] text-gray-300 text-center font-medium leading-relaxed">
                    No payment taken here. We'll finalize your order via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-6 mt-5"
              >
              
              </motion.div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}