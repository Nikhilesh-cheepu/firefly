import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { BAR_MENU_ITEMS, FOOD_MENU_ITEMS } from "../src/data/dummy-menu";
import { resolveDatabaseUrl } from "../src/lib/resolve-database-url";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
const url = resolveDatabaseUrl();
if (!url) {
  throw new Error("No database URL resolved. Set DATABASE_URL or DATABASE_PUBLIC_URL.");
}
process.env.DATABASE_URL = url;

const prisma = new PrismaClient({
  datasources: { db: { url } },
});

async function main() {
  const foodCategoryId = "menu-cat-food";
  const barCategoryId = "menu-cat-bar";

  await prisma.menuCategory.upsert({
    where: { id: foodCategoryId },
    create: { id: foodCategoryId, name: "Food", sortOrder: 0 },
    update: { name: "Food", sortOrder: 0 },
  });

  await prisma.menuCategory.upsert({
    where: { id: barCategoryId },
    create: { id: barCategoryId, name: "Bar", sortOrder: 1 },
    update: { name: "Bar", sortOrder: 1 },
  });

  await prisma.menuItem.deleteMany({
    where: { categoryId: { in: [foodCategoryId, barCategoryId] } },
  });

  await prisma.menuItem.createMany({
    data: FOOD_MENU_ITEMS.map((item, idx) => ({
      id: `food-${item.id}`,
      categoryId: foodCategoryId,
      name: item.name,
      description: item.section,
      price: item.price,
      sortOrder: idx,
    })),
  });

  await prisma.menuItem.createMany({
    data: BAR_MENU_ITEMS.map((item, idx) => ({
      id: `bar-${item.id}`,
      categoryId: barCategoryId,
      name: item.name,
      description: item.section,
      price: item.price,
      sortOrder: idx,
    })),
  });

  console.log(`Synced ${FOOD_MENU_ITEMS.length} food items and ${BAR_MENU_ITEMS.length} bar items.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
