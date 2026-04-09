"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo } from "react";
import type { HappyHourGroup } from "@/data/dummy-menu";

export type MenuSheetKind = "food" | "bar" | "happy" | "cart";

type ListItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | null;
  section?: string | null;
};

type Props = {
  active: MenuSheetKind | null;
  activeMenu: Exclude<MenuSheetKind, "cart">;
  setActiveMenu: (kind: Exclude<MenuSheetKind, "cart">) => void;
  openCart: () => void;
  onClose: () => void;
  search: string;
  setSearch: (value: string) => void;
  sectionFilter: string;
  setSectionFilter: (value: string) => void;
  sections: string[];
  filteredItems: ListItem[];
  cart: Array<{ id: string; name: string; price: number; source: "food" | "bar" | "happy"; qty: number }>;
  cartCount: number;
  subtotal: number;
  gst: number;
  serviceCharge: number;
  grandTotal: number;
  addItem: (item: ListItem, source: "food" | "bar" | "happy") => void;
  decItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  checkoutWhatsApp: () => void;
  checkoutError: string | null;
  happyHourGroups: HappyHourGroup[];
};

export function MenuTopSheet({
  active,
  activeMenu,
  setActiveMenu,
  openCart,
  onClose,
  search,
  setSearch,
  sectionFilter,
  setSectionFilter,
  sections,
  filteredItems,
  cart,
  cartCount,
  subtotal,
  gst,
  serviceCharge,
  grandTotal,
  addItem,
  decItem,
  removeItem,
  clearCart,
  checkoutWhatsApp,
  checkoutError,
  happyHourGroups,
}: Props) {
  const reduce = useReducedMotion();
  const open = active !== null;
  const titleId = useId();
  const cartQtyById = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of cart) map.set(line.id, line.qty);
    return map;
  }, [cart]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const sheetTransition = reduce
    ? { duration: 0.2 }
    : { type: "spring" as const, stiffness: 420, damping: 36 };

  const title =
    active === "food"
      ? "Food menu"
      : active === "bar"
        ? "Bar menu"
        : active === "happy"
          ? "Happy hours"
          : "Your cart";

  const ariaClose =
    active === "food"
      ? "Close Food menu"
      : active === "bar"
        ? "Close Bar menu"
        : active === "happy"
          ? "Close Happy hours"
          : "Close cart";

  return (
    <AnimatePresence>
      {open && active && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col items-stretch justify-start pt-[max(0.75rem,env(safe-area-inset-top))] px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            aria-label={ariaClose}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 mx-auto mt-2 w-full max-w-md overflow-hidden rounded-b-2xl border border-ff-glow/20 border-t-0 bg-ff-void/98 ff-shadow-bar backdrop-blur-xl"
            initial={reduce ? { y: "-100%" } : { y: "-105%" }}
            animate={{ y: 0 }}
            exit={reduce ? { y: "-100%" } : { y: "-105%" }}
            transition={sheetTransition}
          >
            <div className="h-[80vh] overflow-y-auto overscroll-contain px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ff-mist/25" aria-hidden />
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2
                  id={titleId}
                  className="font-[family-name:var(--font-display)] text-lg tracking-wide text-ff-glow"
                >
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-ff-mist transition hover:bg-white/5 hover:text-ff-glow"
                >
                  Close
                </button>
              </div>
              <div className="mb-2 grid grid-cols-4 gap-1.5 rounded-xl border border-ff-glow/15 bg-ff-deep/45 p-1">
                <button
                  type="button"
                  onClick={() => setActiveMenu("food")}
                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${
                    activeMenu === "food"
                      ? "bg-ff-glow/20 text-ff-glow"
                      : "text-ff-mist/80 hover:bg-white/5"
                  }`}
                >
                  Food
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMenu("bar")}
                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${
                    activeMenu === "bar"
                      ? "bg-ff-glow/20 text-ff-glow"
                      : "text-ff-mist/80 hover:bg-white/5"
                  }`}
                >
                  Bar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMenu("happy")}
                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${
                    activeMenu === "happy"
                      ? "bg-ff-glow/20 text-ff-glow"
                      : "text-ff-mist/80 hover:bg-white/5"
                  }`}
                >
                  Happy hrs
                </button>
                <button
                  type="button"
                  onClick={() => (cartCount > 0 ? openCart() : undefined)}
                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${
                    active === "cart"
                      ? "bg-ff-glow/20 text-ff-glow"
                      : cartCount > 0
                        ? "bg-ff-mint/20 text-ff-mint ring-1 ring-ff-mint/35"
                        : "text-ff-mist/80 hover:bg-white/5"
                  }`}
                >
                  Cart ({cartCount})
                </button>
              </div>

              {active !== "cart" && activeMenu !== "happy" && (
                <>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search menu..."
                    className="mb-2 w-full rounded-lg border border-ff-glow/15 bg-ff-void/70 px-3 py-2 text-sm text-white outline-none placeholder:text-ff-mist/45 focus:border-ff-glow/35"
                  />
                  <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {sections.map((section) => (
                      <button
                        key={section}
                        type="button"
                        onClick={() => setSectionFilter(section)}
                        className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] ${
                          sectionFilter === section
                            ? "border-ff-glow/45 bg-ff-glow/15 text-ff-glow"
                            : "border-ff-glow/15 text-ff-mist/75"
                        }`}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeMenu === "happy" && active !== "cart" && (
                <div className="space-y-4 pb-2">
                  <p className="rounded-lg border border-ff-glow/15 bg-ff-deep/40 px-2.5 py-2 text-xs text-ff-mint/90">
                    Happy Hour Timing: 12:30 PM to 7:00 PM (Everyday)
                  </p>
                  {happyHourGroups.map((g) => (
                    <div key={g.title}>
                      <h3 className="mb-2 border-b border-ff-glow/20 pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-ff-mint/90">
                        {g.title}
                      </h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {g.deals.map((d) => (
                          <li
                            key={d.id}
                            className="rounded-xl border border-ff-glow/12 bg-ff-deep/50 px-2.5 py-2"
                          >
                            <div className="min-w-0 space-y-1">
                              <p className="line-clamp-2 text-sm font-medium text-white">{d.name}</p>
                              {d.description && (
                                <p className="line-clamp-2 text-xs text-ff-mist/75">{d.description}</p>
                              )}
                              {d.price && <p className="text-sm font-medium text-ff-glow">{d.price}</p>}
                              {(() => {
                                const qty = cartQtyById.get(d.id) ?? 0;
                                if (qty > 0) {
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        className="h-6 w-6 rounded border border-ff-glow/25 text-xs text-ff-mist"
                                        onClick={() => decItem(d.id)}
                                      >
                                        -
                                      </button>
                                      <span className="min-w-4 text-center text-xs text-ff-mist">{qty}</span>
                                      <button
                                        type="button"
                                        className="h-6 w-6 rounded border border-ff-glow/25 text-xs text-ff-mist"
                                        onClick={() =>
                                          addItem(
                                            { id: d.id, name: d.name, description: d.description, price: d.price },
                                            "happy",
                                          )
                                        }
                                      >
                                        +
                                      </button>
                                    </div>
                                  );
                                }
                                return (
                                  <button
                                    type="button"
                                    className="rounded-md border border-ff-glow/25 px-2 py-1 text-xs text-ff-glow"
                                    onClick={() =>
                                      addItem(
                                        { id: d.id, name: d.name, description: d.description, price: d.price },
                                        "happy",
                                      )
                                    }
                                  >
                                    Add
                                  </button>
                                );
                              })()}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {active !== "cart" && activeMenu !== "happy" && (
                <ul className="grid grid-cols-2 gap-2 pb-2">
                  {filteredItems.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-ff-glow/12 bg-ff-deep/50 px-2.5 py-2"
                    >
                      <div className="space-y-1">
                        {item.section && <p className="line-clamp-1 text-[10px] text-ff-mint/90">{item.section}</p>}
                        <p className="line-clamp-2 text-sm font-medium text-white">{item.name}</p>
                        {item.description && (
                          <p className="line-clamp-2 text-xs text-ff-mist/75">{item.description}</p>
                        )}
                        {item.price && <p className="text-sm font-medium text-ff-glow">{item.price}</p>}
                        {(() => {
                          const qty = cartQtyById.get(item.id) ?? 0;
                          if (qty > 0) {
                            return (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  className="h-6 w-6 rounded border border-ff-glow/25 text-xs text-ff-mist"
                                  onClick={() => decItem(item.id)}
                                >
                                  -
                                </button>
                                <span className="min-w-4 text-center text-xs text-ff-mist">{qty}</span>
                                <button
                                  type="button"
                                  className="h-6 w-6 rounded border border-ff-glow/25 text-xs text-ff-mist"
                                  onClick={() => addItem(item, activeMenu)}
                                >
                                  +
                                </button>
                              </div>
                            );
                          }
                          return (
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                className="rounded-md border border-ff-glow/25 px-2 py-1 text-xs text-ff-glow"
                                onClick={() => addItem(item, activeMenu)}
                              >
                                Add
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {active === "cart" && (
                <div className="mt-1 rounded-xl border border-ff-glow/18 bg-ff-deep/45 p-2.5">
                  {cart.length === 0 ? (
                    <p className="text-xs text-ff-mist/70">Cart is empty.</p>
                  ) : (
                    <>
                      <ul className="space-y-1.5">
                        {cart.map((line) => (
                          <li key={line.id} className="rounded-lg bg-ff-void/45 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="line-clamp-1 text-sm text-white">{line.name}</p>
                              <p className="text-xs text-ff-glow">₹{line.price * line.qty}</p>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              <button
                                type="button"
                                className="h-6 w-6 rounded border border-ff-glow/25 text-xs text-ff-mist"
                                onClick={() => decItem(line.id)}
                              >
                                -
                              </button>
                              <span className="text-xs text-ff-mist">{line.qty}</span>
                              <button
                                type="button"
                                className="h-6 w-6 rounded border border-ff-glow/25 text-xs text-ff-mist"
                                onClick={() =>
                                  addItem({ id: line.id, name: line.name, price: `₹${line.price}` }, line.source)
                                }
                              >
                                +
                              </button>
                              <button
                                type="button"
                                className="ml-auto text-[11px] text-red-200/90"
                                onClick={() => removeItem(line.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 space-y-0.5 text-xs text-ff-mist/85">
                        <p className="flex justify-between"><span>Subtotal</span><span>₹{Math.round(subtotal)}</span></p>
                        <p className="flex justify-between"><span>GST (5%)</span><span>₹{Math.round(gst)}</span></p>
                        <p className="flex justify-between"><span>Service (10%)</span><span>₹{Math.round(serviceCharge)}</span></p>
                        <p className="mt-1 flex justify-between font-semibold text-white"><span>Total</span><span>₹{Math.round(grandTotal)}</span></p>
                      </div>
                      {checkoutError && <p className="mt-1 text-xs text-red-200">{checkoutError}</p>}
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={checkoutWhatsApp}
                          className="flex-1 rounded-lg bg-ff-glow/85 px-3 py-2 text-xs font-semibold text-black"
                        >
                          Order on WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={clearCart}
                          className="rounded-lg border border-ff-glow/25 px-3 py-2 text-xs text-ff-mist"
                        >
                          Clear
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
