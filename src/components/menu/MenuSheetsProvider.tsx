"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { HappyHourGroup } from "@/data/dummy-menu";
import { MenuTopSheet, type MenuSheetKind } from "@/components/menu/MenuTopSheet";
import { waMeHrefFromInput } from "@/lib/indian-phone";

type ListItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | null;
  section?: string | null;
};

type CartLine = {
  id: string;
  name: string;
  price: number;
  source: Exclude<MenuSheetKind, "cart">;
  qty: number;
};

type Ctx = {
  openFoodMenu: () => void;
  openBarMenu: () => void;
  openHappyHours: () => void;
  openCart: () => void;
  closeMenuSheets: () => void;
  activeSheet: MenuSheetKind | null;
  activeMenu: Exclude<MenuSheetKind, "cart">;
  setActiveMenu: (kind: Exclude<MenuSheetKind, "cart">) => void;
  search: string;
  setSearch: (value: string) => void;
  sectionFilter: string;
  setSectionFilter: (value: string) => void;
  sections: string[];
  filteredItems: ListItem[];
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  gst: number;
  serviceCharge: number;
  grandTotal: number;
  addItem: (item: ListItem, source: Exclude<MenuSheetKind, "cart">) => void;
  decItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  checkoutWhatsApp: () => void;
  checkoutError: string | null;
};

const MenuSheetsContext = createContext<Ctx | null>(null);

export function useMenuSheets() {
  const v = useContext(MenuSheetsContext);
  if (!v) {
    throw new Error("useMenuSheets must be used within MenuSheetsProvider");
  }
  return v;
}

export function MenuSheetsProvider({
  children,
  happyHourGroups,
  foodItems,
  beverageItems,
  whatsappRaw,
}: {
  children: ReactNode;
  happyHourGroups: HappyHourGroup[];
  foodItems: ListItem[];
  beverageItems: ListItem[];
  whatsappRaw?: string | null;
}) {
  const [active, setActive] = useState<MenuSheetKind | null>(null);
  const [activeMenu, setActiveMenuState] = useState<Exclude<MenuSheetKind, "cart">>("food");
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const parsePrice = useCallback((raw?: string | null) => {
    if (!raw) return 0;
    const primary = raw.split("/")[0] ?? raw;
    const n = Number(primary.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }, []);

  const closeMenuSheets = useCallback(() => setActive(null), []);
  const openFoodMenu = useCallback(() => {
    setActiveMenuState("food");
    setActive("food");
  }, []);
  const openBarMenu = useCallback(() => {
    setActiveMenuState("bar");
    setActive("bar");
  }, []);
  const openHappyHours = useCallback(() => {
    setActiveMenuState("happy");
    setActive("happy");
  }, []);
  const openCart = useCallback(() => setActive("cart"), []);

  const setActiveMenu = useCallback((kind: Exclude<MenuSheetKind, "cart">) => {
    setActiveMenuState(kind);
    if (kind === "food") setActive("food");
    if (kind === "bar") setActive("bar");
    if (kind === "happy") setActive("happy");
  }, []);

  const activeItems = useMemo(() => {
    if (activeMenu === "food") return foodItems;
    if (activeMenu === "bar") return beverageItems;
    return [];
  }, [activeMenu, foodItems, beverageItems]);

  const sections = useMemo(() => {
    const set = new Set<string>();
    for (const item of activeItems) {
      if (item.section?.trim()) set.add(item.section.trim());
    }
    return ["All", ...Array.from(set)];
  }, [activeItems]);

  useEffect(() => {
    if (!sections.includes(sectionFilter)) {
      setSectionFilter("All");
    }
  }, [sections, sectionFilter]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeItems.filter((item) => {
      if (sectionFilter !== "All" && (item.section ?? "") !== sectionFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q) ||
        (item.section ?? "").toLowerCase().includes(q)
      );
    });
  }, [activeItems, sectionFilter, search]);

  const addItem = useCallback(
    (item: ListItem, source: Exclude<MenuSheetKind, "cart">) => {
      const price = parsePrice(item.price);
      if (price <= 0) return;
      setCart((prev) => {
        const idx = prev.findIndex((line) => line.id === item.id);
        if (idx === -1) {
          return [...prev, { id: item.id, name: item.name, price, source, qty: 1 }];
        }
        const next = [...prev];
        next[idx] = { ...next[idx]!, qty: next[idx]!.qty + 1 };
        return next;
      });
    },
    [parsePrice],
  );

  const decItem = useCallback((id: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((line) => line.id === id);
      if (idx === -1) return prev;
      const line = prev[idx]!;
      if (line.qty <= 1) return prev.filter((x) => x.id !== id);
      const next = [...prev];
      next[idx] = { ...line, qty: line.qty - 1 };
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((line) => line.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const subtotal = useMemo(() => cart.reduce((acc, line) => acc + line.price * line.qty, 0), [cart]);
  const gst = useMemo(() => subtotal * 0.05, [subtotal]);
  const serviceCharge = useMemo(() => subtotal * 0.1, [subtotal]);
  const grandTotal = useMemo(() => subtotal + gst + serviceCharge, [subtotal, gst, serviceCharge]);
  const cartCount = useMemo(() => cart.reduce((acc, line) => acc + line.qty, 0), [cart]);

  const checkoutWhatsApp = useCallback(() => {
    setCheckoutError(null);
    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }
    const href = waMeHrefFromInput(whatsappRaw ?? null);
    if (!href) {
      setCheckoutError("WhatsApp number is not configured.");
      return;
    }
    const fmt = (n: number) => `₹${Math.round(n)}`;
    const lines = [
      "Hi Firefly, I'd like to place an order:",
      "",
      ...cart.map((line) => `- ${line.name} x${line.qty} = ${fmt(line.price * line.qty)}`),
      "",
      `Subtotal: ${fmt(subtotal)}`,
      `GST (5%): ${fmt(gst)}`,
      `Service charge (10%): ${fmt(serviceCharge)}`,
      `Grand total: ${fmt(grandTotal)}`,
    ];
    const url = `${href}${href.includes("?") ? "&" : "?"}text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [cart, whatsappRaw, subtotal, gst, serviceCharge, grandTotal]);

  const value = useMemo(
    () => ({
      openFoodMenu,
      openBarMenu,
      openHappyHours,
      openCart,
      closeMenuSheets,
      activeSheet: active,
      activeMenu,
      setActiveMenu,
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
    }),
    [
      openFoodMenu,
      openBarMenu,
      openHappyHours,
      openCart,
      closeMenuSheets,
      active,
      activeMenu,
      setActiveMenu,
      search,
      sectionFilter,
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
    ],
  );

  return (
    <MenuSheetsContext.Provider value={value}>
      {children}
      <MenuTopSheet
        active={active}
        onClose={closeMenuSheets}
        openCart={openCart}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        search={search}
        setSearch={setSearch}
        sectionFilter={sectionFilter}
        setSectionFilter={setSectionFilter}
        sections={sections}
        filteredItems={filteredItems}
        cart={cart}
        cartCount={cartCount}
        subtotal={subtotal}
        gst={gst}
        serviceCharge={serviceCharge}
        grandTotal={grandTotal}
        addItem={addItem}
        decItem={decItem}
        removeItem={removeItem}
        clearCart={clearCart}
        checkoutWhatsApp={checkoutWhatsApp}
        checkoutError={checkoutError}
        happyHourGroups={happyHourGroups}
      />
    </MenuSheetsContext.Provider>
  );
}
