import type { MenuCategory, MenuItem } from "@prisma/client";

/** Shape matches Prisma `MenuCategory` + nested `items` from `getMenuCategories`. */
export type CategoryWithItems = MenuCategory & { items: MenuItem[] };

export const DUMMY_MENU_CATEGORIES: CategoryWithItems[] = [
  {
    id: "dummy-cat-food",
    sortOrder: 0,
    name: "Food",
    items: [
      {
        id: "dummy-food-1",
        categoryId: "dummy-cat-food",
        sortOrder: 0,
        name: "Hyderabad spice skewers",
        description: "Charred peppers, house rub, lime (sample).",
        price: "₹420",
        imageUrl: null,
      },
      {
        id: "dummy-food-2",
        categoryId: "dummy-cat-food",
        sortOrder: 1,
        name: "Guntur chilli wings",
        description: "Crispy, tangy glaze, cooling dip (sample).",
        price: "₹380",
        imageUrl: null,
      },
      {
        id: "dummy-food-3",
        categoryId: "dummy-cat-food",
        sortOrder: 2,
        name: "Midnight masala fries",
        description: "Loaded fries, cheese, herbs (sample).",
        price: "₹320",
        imageUrl: null,
      },
      {
        id: "dummy-food-4",
        categoryId: "dummy-cat-food",
        sortOrder: 3,
        name: "Coastal prawn fry",
        description: "Coconut, curry leaf, lemon (sample).",
        price: "₹560",
        imageUrl: null,
      },
    ],
  },
  {
    id: "dummy-cat-beverages",
    sortOrder: 1,
    name: "Beverages",
    items: [
      {
        id: "dummy-bev-1",
        categoryId: "dummy-cat-beverages",
        sortOrder: 0,
        name: "Classic mojito",
        description: "Mint, lime, soda (sample).",
        price: "₹350",
        imageUrl: null,
      },
      {
        id: "dummy-bev-2",
        categoryId: "dummy-cat-beverages",
        sortOrder: 1,
        name: "Virgin sunrise",
        description: "Orange, grenadine, fizz (sample).",
        price: "₹280",
        imageUrl: null,
      },
      {
        id: "dummy-bev-3",
        categoryId: "dummy-cat-beverages",
        sortOrder: 2,
        name: "Cold brew tonic",
        description: "Coffee, tonic, citrus (sample).",
        price: "₹300",
        imageUrl: null,
      },
      {
        id: "dummy-bev-4",
        categoryId: "dummy-cat-beverages",
        sortOrder: 3,
        name: "Sparkling ginger ale",
        description: "House ginger, soda (sample).",
        price: "₹220",
        imageUrl: null,
      },
    ],
  },
];

export type HappyHourDeal = {
  id: string;
  name: string;
  description?: string;
  price?: string;
};

export type HappyHourGroup = {
  title: string;
  deals: HappyHourDeal[];
};

/** Dummy happy hours — replace when final menu is ready. */
export const DUMMY_HAPPY_HOURS: HappyHourGroup[] = [
  {
    title: "Happy hour specials",
    deals: [
      {
        id: "hh-1",
        name: "House highball",
        description: "Select spirits + mixer (sample).",
        price: "₹299",
      },
      {
        id: "hh-2",
        name: "Beer bucket",
        description: "4 domestic pours (sample).",
        price: "₹899",
      },
      {
        id: "hh-3",
        name: "Bar bites combo",
        description: "Two small plates (sample).",
        price: "₹649",
      },
    ],
  },
  {
    title: "Evening window",
    deals: [
      {
        id: "hh-4",
        name: "2-for-1 mocktails",
        description: "On select drinks (sample).",
        price: "—",
      },
      {
        id: "hh-5",
        name: "DJ night shot tray",
        description: "Chef’s pick (sample).",
        price: "₹499",
      },
    ],
  },
];
