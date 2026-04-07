"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { HappyHourGroup } from "@/data/dummy-menu";
import { MenuTopSheet, type MenuSheetKind } from "@/components/menu/MenuTopSheet";

type ListItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | null;
};

type Ctx = {
  openFoodMenu: () => void;
  openBeverageMenu: () => void;
  openHappyHours: () => void;
  closeMenuSheets: () => void;
  activeSheet: MenuSheetKind | null;
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
}: {
  children: ReactNode;
  happyHourGroups: HappyHourGroup[];
  foodItems: ListItem[];
  beverageItems: ListItem[];
}) {
  const [active, setActive] = useState<MenuSheetKind | null>(null);

  const closeMenuSheets = useCallback(() => setActive(null), []);
  const openFoodMenu = useCallback(() => setActive("food"), []);
  const openBeverageMenu = useCallback(() => setActive("beverages"), []);
  const openHappyHours = useCallback(() => setActive("happy"), []);

  const value = useMemo(
    () => ({
      openFoodMenu,
      openBeverageMenu,
      openHappyHours,
      closeMenuSheets,
      activeSheet: active,
    }),
    [active, openFoodMenu, openBeverageMenu, openHappyHours, closeMenuSheets],
  );

  return (
    <MenuSheetsContext.Provider value={value}>
      {children}
      <MenuTopSheet
        active={active}
        onClose={closeMenuSheets}
        happyHourGroups={happyHourGroups}
        foodItems={foodItems}
        beverageItems={beverageItems}
      />
    </MenuSheetsContext.Provider>
  );
}
