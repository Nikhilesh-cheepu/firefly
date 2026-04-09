import { PrismaClient } from "@prisma/client";
import { DUMMY_REVIEWS } from "../src/data/dummy-reviews";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  const food = await prisma.menuCategory.upsert({
    where: { id: "seed-food" },
    create: { id: "seed-food", name: "Small plates", sortOrder: 0 },
    update: {},
  });

  await prisma.menuItem.upsert({
    where: { id: "seed-item-1" },
    create: {
      id: "seed-item-1",
      categoryId: food.id,
      name: "Hyderabad spice skewers",
      description: "Charred peppers, house rub, lime.",
      price: "₹420",
      sortOrder: 0,
    },
    update: {},
  });


  await prisma.heroSlide.upsert({
    where: { id: "seed-hero-1" },
    create: {
      id: "seed-hero-1",
      sortOrder: 0,
      type: "IMAGE",
      mediaUrl:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
      isActive: true,
    },
    update: {},
  });

  await prisma.heroSlide.upsert({
    where: { id: "seed-hero-2" },
    create: {
      id: "seed-hero-2",
      sortOrder: 1,
      type: "IMAGE",
      mediaUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80",
      title: "Tonight",
      isActive: true,
    },
    update: {},
  });

  await prisma.galleryImage.upsert({
    where: { id: "seed-g1" },
    create: {
      id: "seed-g1",
      url: "https://images.unsplash.com/photo-1571266028243-e473f6c25b8d?w=800&q=80",
      alt: "Club lights",
      sortOrder: 0,
    },
    update: {},
  });

  for (const r of DUMMY_REVIEWS) {
    const id = `seed-rev-${r.id}`;
    await prisma.guestReview.upsert({
      where: { id },
      create: {
        id,
        status: "APPROVED",
        rating: r.rating,
        body: r.quote,
        authorName: r.name,
      },
      update: {
        rating: r.rating,
        body: r.quote,
        authorName: r.name,
        status: "APPROVED",
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
