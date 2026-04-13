// Idempotent seeder for PL identification dataset.
// Run: `npx tsx src/lib/identify/seed.ts`
//
// Uses upserts keyed on natural identifiers (inn, commercialName) so it can
// be re-run safely. The eventual URPL sync should follow the same pattern
// but key on registrationNo.

import { prisma } from "@/lib/db/client";
import { normalize, normalizeKey } from "./normalize";
import { seedProducts, seedSubstances } from "./seed-data";

async function main() {
  for (const s of seedSubstances) {
    await prisma.plSubstance.upsert({
      where: { inn: s.inn },
      create: { inn: s.inn, atcCode: s.atcCode },
      update: { atcCode: s.atcCode },
    });
  }

  for (const p of seedProducts) {
    const nameNormalized = normalize(p.commercialName).normalized;

    const product = await prisma.plProduct.upsert({
      where: {
        // No natural composite unique exists in schema; use registrationNo
        // when present, otherwise create-or-find by (commercialName, manufacturer).
        registrationNo: p.registrationNo ?? `seed:${nameNormalized}:${p.manufacturer ?? ""}`,
      },
      create: {
        commercialName: p.commercialName,
        nameNormalized,
        dosageForm: p.dosageForm,
        strength: p.strength,
        manufacturer: p.manufacturer,
        prescription: p.prescription,
        source: p.source,
        sourceUpdatedAt: new Date(),
        registrationNo: p.registrationNo ?? `seed:${nameNormalized}:${p.manufacturer ?? ""}`,
      },
      update: {
        commercialName: p.commercialName,
        nameNormalized,
        dosageForm: p.dosageForm,
        strength: p.strength,
        manufacturer: p.manufacturer,
        prescription: p.prescription,
        source: p.source,
        sourceUpdatedAt: new Date(),
      },
    });

    await prisma.plProductSubstance.deleteMany({ where: { productId: product.id } });
    for (const ps of p.substances) {
      const sub = await prisma.plSubstance.findUnique({ where: { inn: ps.inn } });
      if (!sub) throw new Error(`Missing substance: ${ps.inn}`);
      await prisma.plProductSubstance.create({
        data: { productId: product.id, substanceId: sub.id, strength: ps.strength },
      });
    }

    await prisma.plProductAlias.deleteMany({ where: { productId: product.id } });
    for (const a of p.aliases ?? []) {
      const aliasNormalized = normalizeKey(a.alias);
      if (!aliasNormalized) continue;
      await prisma.plProductAlias.create({
        data: {
          productId: product.id,
          alias: a.alias,
          aliasNormalized,
          kind: a.kind,
        },
      });
    }
  }

  const productCount = await prisma.plProduct.count();
  const aliasCount = await prisma.plProductAlias.count();
  const substanceCount = await prisma.plSubstance.count();
  console.log(`Seeded: ${productCount} products, ${aliasCount} aliases, ${substanceCount} substances`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
