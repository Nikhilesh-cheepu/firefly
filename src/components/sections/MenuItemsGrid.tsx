"use client";

import type { MenuCategory, MenuItem } from "@prisma/client";
import { motion, useReducedMotion } from "framer-motion";

type CategoryWithItems = MenuCategory & { items: MenuItem[] };

type Props = {
  categories: CategoryWithItems[];
};

export function MenuItemsGrid({ categories }: Props) {
  const reduce = useReducedMotion();
  let index = 0;

  return (
    <div className="space-y-14 md:space-y-20">
      {categories.map((cat) => (
        <div key={cat.id}>
          <h3 className="mb-6 border-b border-ff-glow/25 pb-2 font-[family-name:var(--font-display)] text-2xl text-ff-mint">
            {cat.name}
          </h3>
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {cat.items.map((item) => {
              const i = index++;
              return (
                <motion.li
                  key={item.id}
                  className="group"
                  initial={reduce ? undefined : { opacity: 0, y: 16 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-32px" }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(i * 0.04, 0.4),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={reduce ? undefined : { y: -3 }}
                  whileTap={reduce ? undefined : { scale: 0.99 }}
                >
                  <div className="ff-card ff-card-interactive h-full overflow-hidden rounded-2xl border border-ff-mint/12 bg-ff-void/75 p-4 ring-1 ring-white/[0.03] backdrop-blur-sm">
                    <div className="flex gap-4">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-24 w-24 shrink-0 rounded-xl object-cover ring-1 ring-ff-glow/15 transition duration-300 ease-out group-hover:ring-ff-glow/35"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-24 w-24 shrink-0 rounded-xl bg-gradient-to-br from-ff-forest to-ff-deep ring-1 ring-ff-mint/10" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-white">{item.name}</h4>
                          {item.price && (
                            <span className="shrink-0 text-sm font-medium text-ff-glow">
                              {item.price}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-sm leading-relaxed text-ff-mist/80">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
