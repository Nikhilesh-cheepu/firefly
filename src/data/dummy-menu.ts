import type { MenuCategory, MenuItem } from "@prisma/client";

/** Shape matches Prisma `MenuCategory` + nested `items` from `getMenuCategories`. */
export type CategoryWithItems = MenuCategory & { items: MenuItem[] };

export type CatalogMenuItem = {
  id: string;
  name: string;
  section: string;
  price: string;
  description?: string;
};

export const FOOD_MENU_ITEMS: CatalogMenuItem[] = [
  { id: "f-1", section: "Bar snacks bites / Veg", name: "Green Salad", price: "₹75" },
  { id: "f-2", section: "Bar snacks bites / Veg", name: "Assorted Chips", price: "₹75" },
  { id: "f-3", section: "Bar snacks bites / Veg", name: "Mirchi Bajji", price: "₹85" },
  { id: "f-3a", section: "Bar snacks bites / Veg", name: "Masala Papad", price: "₹85" },
  { id: "f-3b", section: "Bar snacks bites / Veg", name: "Fruits Salad", price: "₹95" },
  { id: "f-3c", section: "Bar snacks bites / Veg", name: "Peanut Masala", price: "₹95" },
  { id: "f-3d", section: "Bar snacks bites / Veg", name: "Bruschetta", price: "₹95" },
  { id: "f-4", section: "Bar snacks bites / Veg", name: "Onion Pakodi", price: "₹85" },
  { id: "f-5", section: "Bar snacks bites / Veg", name: "Cocktail Samosa", price: "₹95" },
  { id: "f-5a", section: "Bar snacks bites / Veg", name: "Onion Rings", price: "₹95/180" },
  { id: "f-6", section: "Bar snacks bites / Veg", name: "Corn Wada", price: "₹95/180" },
  { id: "f-6a", section: "Bar snacks bites / Veg", name: "Corn Cheese Balls", price: "₹95/180" },
  { id: "f-6b", section: "Bar snacks bites / Veg", name: "Corn Tikki", price: "₹95/180" },
  { id: "f-6c", section: "Bar snacks bites / Veg", name: "Hara Bara Kebab", price: "₹95/180" },
  { id: "f-6d", section: "Bar snacks bites / Veg", name: "Veg Nuggets", price: "₹95/180" },
  { id: "f-7", section: "Bar snacks bites / Veg", name: "French Fries (salt & peri peri)", price: "₹95/180" },
  { id: "f-7a", section: "Bar snacks bites / Veg", name: "Phool Makhana Salt & Pepper", price: "₹95/180" },
  { id: "f-7b", section: "Bar snacks bites / Veg", name: "Gobi Pakodi", price: "₹95/180" },
  { id: "f-8", section: "Bar snacks bites / Veg", name: "Paneer Fingers", price: "₹95/180" },
  { id: "f-9", section: "Bar snacks bites / Non-Veg", name: "Spicy Roasted Egg Slices", price: "₹95" },
  { id: "f-9a", section: "Bar snacks bites / Non-Veg", name: "Egg Burji", price: "₹95" },
  { id: "f-9b", section: "Bar snacks bites / Non-Veg", name: "Egg Pakodi", price: "₹95/180" },
  { id: "f-10", section: "Bar snacks bites / Non-Veg", name: "Chicken Kebab", price: "₹105/200" },
  { id: "f-10a", section: "Bar snacks bites / Non-Veg", name: "Chicken Popcorn", price: "₹105/200" },
  { id: "f-11", section: "Bar snacks bites / Non-Veg", name: "Fried Chicken Wings", price: "₹105/200" },
  { id: "f-11a", section: "Bar snacks bites / Non-Veg", name: "Chicken Nuggets", price: "₹105/200" },
  { id: "f-12", section: "Bar snacks bites / Non-Veg", name: "Kodi Chips", price: "₹125/240" },
  { id: "f-13", section: "Bar snacks bites", name: "Andhra Chicken Fry", price: "₹135/260" },
  { id: "f-14", section: "Bar snacks bites", name: "Fish N Chips", price: "₹135/260" },
  { id: "f-14a", section: "Bar snacks bites", name: "Fish Tawa Fry", price: "₹135/260" },
  { id: "f-15", section: "Bar snacks bites", name: "Prawns Vepudu", price: "₹145/280" },
  { id: "f-15a", section: "Bar snacks bites", name: "Mutton Fry", price: "₹155/300" },
  { id: "f-16", section: "Appetizers - Pan Asian / Veg", name: "Crispy Corn Salt and Pepper", price: "₹125/240" },
  { id: "f-17", section: "Appetizers - Pan Asian / Veg", name: "Veg Manchurian", price: "₹125/240" },
  { id: "f-17a", section: "Appetizers - Pan Asian / Veg", name: "Gobi Manchurian", price: "₹125/240" },
  { id: "f-17b", section: "Appetizers - Pan Asian / Veg", name: "Baby Corn Chilli", price: "₹135/260" },
  { id: "f-18", section: "Appetizers - Pan Asian / Veg", name: "Chilli Paneer", price: "₹135/260" },
  { id: "f-18a", section: "Appetizers - Pan Asian / Veg", name: "Lotus Stem Honey Chilli", price: "₹135/260" },
  { id: "f-19", section: "Appetizers - Pan Asian / Non-Veg", name: "Roasted Egg Chilli", price: "₹125/240" },
  { id: "f-20", section: "Appetizers - Pan Asian / Non-Veg", name: "Chilli Chicken", price: "₹145/280" },
  { id: "f-20a", section: "Appetizers - Pan Asian / Non-Veg", name: "Chicken Lollypop", price: "₹145/280" },
  { id: "f-20b", section: "Appetizers - Pan Asian / Non-Veg", name: "Majestic Chicken", price: "₹145/280" },
  { id: "f-21", section: "Appetizers - Pan Asian / Non-Veg", name: "Chicken 65", price: "₹145/280" },
  { id: "f-22", section: "Appetizers - Pan Asian / Non-Veg", name: "Thai Chilli Fish", price: "₹155/300" },
  { id: "f-23", section: "Appetizers - Pan Asian / Non-Veg", name: "Butter Garlic Prawns", price: "₹155/300" },
  { id: "f-24", section: "Appetizers - Charcoal & Grill / Veg", name: "Tandoori Pineapple", price: "₹125/240" },
  { id: "f-25", section: "Appetizers - Charcoal & Grill / Veg", name: "Tandoori Gobi", price: "₹125/240" },
  { id: "f-26", section: "Appetizers - Charcoal & Grill / Veg", name: "Paneer Tikka", price: "₹155/300" },
  { id: "f-26a", section: "Appetizers - Charcoal & Grill / Veg", name: "Tandoori Malai Broccoli", price: "₹155/300" },
  { id: "f-27", section: "Appetizers - Charcoal & Grill / Non-Veg", name: "Tangdi Kebab", price: "₹125" },
  { id: "f-28", section: "Appetizers - Charcoal & Grill / Non-Veg", name: "Chicken Tikka", price: "₹155/300" },
  { id: "f-29", section: "Appetizers - Charcoal & Grill / Non-Veg", name: "Murgh Malai Tikka", price: "₹165/320" },
  { id: "f-30", section: "Breads", name: "Roti", price: "₹55" },
  { id: "f-31", section: "Breads", name: "Naan", price: "₹60" },
  { id: "f-32", section: "Breads", name: "Garlic Naan", price: "₹65" },
  { id: "f-33", section: "Pizzas / Veg", name: "Mexican Pizza", price: "₹155/300" },
  { id: "f-34", section: "Pizzas / Veg", name: "Classic Margherita", price: "₹155/300" },
  { id: "f-34a", section: "Pizzas / Veg", name: "Farmers Choice", price: "₹165/320" },
  { id: "f-34b", section: "Pizzas / Veg", name: "Paneer Tikka Pizza", price: "₹165/320" },
  { id: "f-35", section: "Pizzas / Non-Veg", name: "Chicken Tikka Pizza", price: "₹185/360" },
  { id: "f-35a", section: "Pizzas / Non-Veg", name: "Pepperoni Chicken", price: "₹185/360" },
  { id: "f-35b", section: "Main - Rice, Noodles, Biryanis", name: "Dal Fry", price: "₹125" },
  { id: "f-36", section: "Main - Rice, Noodles, Biryanis", name: "Paneer Butter Masala", price: "₹135" },
  { id: "f-36a", section: "Main - Rice, Noodles, Biryanis", name: "Kadai Paneer", price: "₹135" },
  { id: "f-36b", section: "Main - Rice, Noodles, Biryanis", name: "Dal Khichdi", price: "₹155" },
  { id: "f-36c", section: "Main - Rice, Noodles, Biryanis", name: "Ghee Rice", price: "₹155" },
  { id: "f-36d", section: "Main - Rice, Noodles, Biryanis", name: "Jeera Rice", price: "₹155" },
  { id: "f-36e", section: "Main - Rice, Noodles, Biryanis", name: "Curd Rice", price: "₹155" },
  { id: "f-36f", section: "Main - Rice, Noodles, Biryanis", name: "Veg Biryani", price: "₹295" },
  { id: "f-37", section: "Main - Rice, Noodles, Biryanis", name: "Chicken Biryani", price: "₹320" },
  { id: "f-38", section: "Main - Rice, Noodles, Biryanis", name: "Chicken Tikka Masala", price: "₹185" },
  { id: "f-38a", section: "Main - Rice, Noodles, Biryanis", name: "Chettinadu Chicken", price: "₹185" },
  { id: "f-39", section: "Main - Rice, Noodles, Biryanis", name: "Fried Rice (Veg/Egg/Chicken)", price: "₹225/255/285" },
  { id: "f-39a", section: "Main - Rice, Noodles, Biryanis", name: "Hakka Noodles (Veg/Egg/Chicken)", price: "₹225/255/285" },
  { id: "f-39b", section: "Main - Rice, Noodles, Biryanis", name: "Manchuria Gravy (Vegballs/Paneer/Chicken)", price: "₹225/255/285" },
  { id: "f-39c", section: "Main - Rice, Noodles, Biryanis", name: "Chilli Gravy (Vegballs/Paneer/Chicken)", price: "₹225/255/285" },
  { id: "f-39d", section: "Main - Rice, Noodles, Biryanis", name: "Schezwan Gravy (Vegballs/Paneer/Chicken)", price: "₹225/255/285" },
  { id: "f-40", section: "Desserts", name: "Gulab Jamoon", price: "₹65" },
  { id: "f-40a", section: "Desserts", name: "Churros", price: "₹125" },
  { id: "f-41", section: "Desserts", name: "Brownie Delight", price: "₹125" },
  { id: "f-41a", section: "Desserts", name: "Lichee Delight", price: "₹155" },
  { id: "f-41b", section: "Desserts", name: "Apricot Delight", price: "₹155" },
  { id: "f-42", section: "Desserts", name: "Ice Cream Scoop", price: "₹95" },
];

export const BAR_MENU_ITEMS: CatalogMenuItem[] = [
  { id: "b-1", section: "Beer", name: "KF Ultra", price: "₹230" },
  { id: "b-2", section: "Beer", name: "Carlsberg", price: "₹239" },
  { id: "b-3", section: "Beer", name: "Budweiser", price: "₹239" },
  { id: "b-4", section: "Beer", name: "Budweiser Magnum", price: "₹245" },
  { id: "b-5", section: "Beer", name: "Heineken", price: "₹269" },
  { id: "b-6", section: "Beer", name: "Corona Extra", price: "₹329" },
  { id: "b-7", section: "On the Tap", name: "KF Draught", price: "₹219" },
  { id: "b-8", section: "On the Tap", name: "Budweiser Draught", price: "₹229" },
  { id: "b-9", section: "Geist Craft Beer", name: "Witty Wit", price: "₹329" },
  { id: "b-10", section: "Geist Craft Beer", name: "Uncle Dunkel", price: "₹329" },
  { id: "b-11", section: "Blended Whiskey", name: "100 Pipers", price: "₹189" },
  { id: "b-12", section: "Blended Whiskey", name: "Black Dog 12 Yrs", price: "₹289" },
  { id: "b-13", section: "Blended Whiskey", name: "JW Black Label 12 Yrs", price: "₹359" },
  { id: "b-14", section: "Blended Whiskey", name: "Chivas Regal 12 Yrs", price: "₹359" },
  { id: "b-15", section: "Blended Whiskey", name: "Royal Salute 21 Yrs", price: "₹1999" },
  { id: "b-16", section: "Single Malt", name: "Indri", price: "₹359" },
  { id: "b-17", section: "Single Malt", name: "Amrut Fusion", price: "₹359" },
  { id: "b-18", section: "Single Malt", name: "Glenfiddich 12 Yrs", price: "₹529" },
  { id: "b-19", section: "Tequila", name: "Desmond's 51 Agave", price: "₹299" },
  { id: "b-20", section: "Tequila", name: "Jose Cuervo Silver", price: "₹399" },
  { id: "b-21", section: "Vodka", name: "Absolut", price: "₹229" },
  { id: "b-22", section: "Vodka", name: "Grey Goose", price: "₹339" },
  { id: "b-23", section: "Gin", name: "Bombay Sapphire", price: "₹229" },
  { id: "b-24", section: "Gin", name: "Greater Than London", price: "₹229" },
  { id: "b-25", section: "Cocktails", name: "Mojito", price: "₹399" },
  { id: "b-26", section: "Cocktails", name: "Sex on The Beach", price: "₹399" },
  { id: "b-27", section: "Cocktails", name: "Screwdriver", price: "₹399" },
  { id: "b-28", section: "Cocktails", name: "Cosmopolitan", price: "₹399" },
  { id: "b-29", section: "Cocktails", name: "Hot Toddy", price: "₹449" },
  { id: "b-30", section: "Cocktails", name: "Margarita Classic", price: "₹479" },
  { id: "b-31", section: "Cocktails", name: "Whiskey Sour", price: "₹479" },
  { id: "b-32", section: "Cocktails", name: "Long Island", price: "₹799" },
  { id: "b-33", section: "Non-Alcoholic", name: "Red and Juice", price: "₹149" },
  { id: "b-34", section: "Non-Alcoholic", name: "Virgin Mojito", price: "₹299" },
  { id: "b-35", section: "Non-Alcoholic", name: "Blue Angel", price: "₹299" },
  { id: "b-36", section: "Non-Alcoholic", name: "Pink Beauty", price: "₹299" },
  { id: "b-37", section: "Non-Alcoholic", name: "Fruit Punch", price: "₹299" },
  { id: "b-38", section: "Non-Alcoholic", name: "Guava Marry", price: "₹299" },
];

export const DUMMY_MENU_CATEGORIES: CategoryWithItems[] = [
  {
    id: "menu-cat-food",
    sortOrder: 0,
    name: "Food",
    items: FOOD_MENU_ITEMS.map((item, idx) => ({
      id: `food-${item.id}`,
      categoryId: "menu-cat-food",
      sortOrder: idx,
      name: item.name,
      description: item.description ?? item.section,
      price: item.price,
      imageUrl: null,
    })),
  },
  {
    id: "menu-cat-bar",
    sortOrder: 1,
    name: "Bar",
    items: BAR_MENU_ITEMS.map((item, idx) => ({
      id: `bar-${item.id}`,
      categoryId: "menu-cat-bar",
      sortOrder: idx,
      name: item.name,
      description: item.description ?? item.section,
      price: item.price,
      imageUrl: null,
    })),
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
    title: "Drinks @99",
    deals: [
      { id: "hh-1", name: "Oaken Glow Whiskey", price: "₹99" },
      { id: "hh-2", name: "Mansion House Brandy", price: "₹99" },
      { id: "hh-3", name: "Xclamation Vodka", price: "₹99" },
      { id: "hh-4", name: "Old Monk Rum", price: "₹99" },
      { id: "hh-5", name: "Ginsin London Dry Gin", price: "₹99" },
    ],
  },
  {
    title: "Drinks @129",
    deals: [
      { id: "hh-6", name: "Blenders Pride Whiskey", price: "₹129" },
      { id: "hh-7", name: "RC American Pride Whiskey", price: "₹129" },
      { id: "hh-7a", name: "Mc Irish Trail Whiskey", price: "₹129" },
      { id: "hh-8", name: "Fireball Whiskey", price: "₹129" },
      { id: "hh-9", name: "Smirnoff Vodka", price: "₹129" },
      { id: "hh-10", name: "Bacardi White Rum", price: "₹129" },
      { id: "hh-10a", name: "Kyron Brandy", price: "₹129" },
    ],
  },
  {
    title: "Drinks @169",
    deals: [
      { id: "hh-11", name: "Black Dog Whiskey", price: "₹169" },
      { id: "hh-12", name: "100 Pipers Whiskey", price: "₹169" },
      { id: "hh-13", name: "Black & White Whiskey", price: "₹169" },
      { id: "hh-14", name: "Beefeater Gin", price: "₹169" },
    ],
  },
  {
    title: "Drinks @199",
    deals: [
      { id: "hh-15", name: "Ballantine's Whiskey", price: "₹199" },
      { id: "hh-16", name: "Jameson Irish Whiskey", price: "₹199" },
      { id: "hh-17", name: "JW Red Label Whiskey", price: "₹199" },
      { id: "hh-17a", name: "Jim Beam Whiskey", price: "₹199" },
      { id: "hh-17b", name: "Absolut Vodka", price: "₹199" },
      { id: "hh-18", name: "Bombay Sapphire Gin", price: "₹199" },
    ],
  },
  {
    title: "Drinks @249",
    deals: [
      { id: "hh-19", name: "100 Pipers 12 Yrs Whiskey", price: "₹249" },
      { id: "hh-20", name: "Black Dog 12 Yrs Whiskey", price: "₹249" },
      { id: "hh-21", name: "Jack Daniel's Whiskey", price: "₹249" },
      { id: "hh-22", name: "Desmon Ji Tequilla", price: "₹249" },
    ],
  },
  {
    title: "Drinks @299",
    deals: [
      { id: "hh-23", name: "JW Black Label Whiskey", price: "₹299" },
      { id: "hh-24", name: "Chivas Regal Whiskey", price: "₹299" },
    ],
  },
  {
    title: "Draught Beer",
    deals: [
      { id: "hh-25", name: "Kingfisher", price: "₹169" },
      { id: "hh-26", name: "Budweiser", price: "₹199" },
    ],
  },
  {
    title: "Mocktails @179",
    deals: [
      { id: "hh-27", name: "Virgin Mojito", price: "₹179" },
      { id: "hh-28", name: "Pink Beauty", price: "₹179" },
      { id: "hh-29", name: "Guava Marry", price: "₹179" },
      { id: "hh-30", name: "Fruit Punch", price: "₹179" },
      { id: "hh-31", name: "Pineapple Punch", price: "₹179" },
    ],
  },
  {
    title: "Cocktails @249",
    deals: [
      { id: "hh-32", name: "Mojito", price: "₹249" },
      { id: "hh-33", name: "Blue Lagoon", price: "₹249" },
      { id: "hh-34", name: "Cosmopolitan", price: "₹249" },
      { id: "hh-35", name: "Sex on the Beach", price: "₹249" },
      { id: "hh-36", name: "Screwdriver", price: "₹249" },
      { id: "hh-37", name: "Whiskey Sour", price: "₹249" },
    ],
  },
];
