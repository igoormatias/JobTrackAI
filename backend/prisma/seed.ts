import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COMPANIES = [
  { name: "Nubank", industry: "Fintech", location: "São Paulo, SP" },
  { name: "Stone", industry: "Fintech", location: "São Paulo, SP" },
  { name: "iFood", industry: "Foodtech", location: "Osasco, SP" },
  { name: "PicPay", industry: "Fintech", location: "São Paulo, SP" },
  { name: "Mercado Livre", industry: "E-commerce", location: "São Paulo, SP" },
  { name: "Hotmart", industry: "Edtech", location: "Belo Horizonte, MG" },
  { name: "CI&T", industry: "Consultoria", location: "Campinas, SP" },
  { name: "XP Inc.", industry: "Fintech", location: "São Paulo, SP" },
  { name: "B3", industry: "Financeiro", location: "São Paulo, SP" },
  { name: "Loft", industry: "Proptech", location: "São Paulo, SP" },
  { name: "QuintoAndar", industry: "Proptech", location: "São Paulo, SP" },
  { name: "Magalu", industry: "Varejo", location: "São Paulo, SP" },
] as const;

const AREAS = [
  "frontend",
  "backend",
  "full_stack",
  "mobile",
  "devops",
  "data_engineer",
] as const;

const SENIORITIES = ["junior", "mid", "senior", "lead"] as const;
const MODALITIES = ["remote", "hybrid", "onsite"] as const;
const SOURCES = ["gupy", "linkedin", "programathor"] as const;
const TECH_POOL = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "Java",
  "Docker",
  "AWS",
  "PostgreSQL",
  "GraphQL",
];

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const TITLES: Record<(typeof AREAS)[number], string[]> = {
  frontend: ["Frontend Engineer", "React Developer", "UI Engineer"],
  backend: ["Backend Engineer", "Node.js Developer", "Java Developer"],
  full_stack: ["Full Stack Engineer", "Software Engineer"],
  mobile: ["Mobile Developer", "React Native Engineer"],
  devops: ["DevOps Engineer", "SRE"],
  data_engineer: ["Data Engineer", "Analytics Engineer"],
};

async function main(): Promise<void> {
  const existing = await prisma.job.count({ where: { isCatalog: true } });
  if (existing >= 100) {
    console.log(`Catalog already seeded (${existing} jobs). Skipping.`);
    return;
  }

  await prisma.job.deleteMany({ where: { isCatalog: true } });

  const jobs = Array.from({ length: 120 }, (_, index) => {
    const i = index + 1;
    const company = COMPANIES[index % COMPANIES.length]!;
    const area = AREAS[index % AREAS.length]!;
    const titles = TITLES[area];
    const title = titles[index % titles.length]!;
    const seniority = SENIORITIES[index % SENIORITIES.length]!;
    const modality = MODALITIES[index % MODALITIES.length]!;
    const source = SOURCES[index % SOURCES.length]!;
    const salaryMin = 6000 + (index % 8) * 1000;
    const salaryMax = salaryMin + 4000;
    const techCount = 4 + (index % 3);
    const technologies = Array.from({ length: techCount }, (_, t) => {
      const name = TECH_POOL[(index + t) % TECH_POOL.length]!;
      return { id: `tech_${i}_${t}`, name, slug: slugify(name) };
    });

    return {
      id: `job_${String(i).padStart(4, "0")}`,
      userId: null,
      companyName: company.name,
      companySlug: slugify(company.name),
      title,
      slug: slugify(`${title}-${company.name}-${i}`),
      description: `Oportunidade para ${title} na ${company.name}. Trabalhe com ${technologies.map((t) => t.name).join(", ")}.`,
      sourceUrl: `https://${source}.com.br/vagas/${i}`,
      source,
      area,
      seniority,
      modality,
      location: company.location,
      salaryMin,
      salaryMax,
      currency: "BRL",
      status: "active",
      isCatalog: true,
      publishedAt: new Date(Date.now() - index * 86_400_000),
      metadata: {
        technologies,
        requirements: technologies.map((t) => t.name),
        benefits: ["Plano de saúde", "VR/VA", "Home office"],
        company: {
          id: `company_${slugify(company.name)}`,
          name: company.name,
          slug: slugify(company.name),
          logoUrl: null,
          industry: company.industry,
        },
      },
    };
  });

  await prisma.job.createMany({ data: jobs });
  console.log(`Seeded ${jobs.length} catalog jobs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
