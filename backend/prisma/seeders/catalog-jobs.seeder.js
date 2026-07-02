import { AREAS, buildSourceUrl, CATALOG_JOB_COUNT, COMPANIES, MODALITIES, SALARY_BY_SENIORITY, SENIORITIES, slugify, SOURCES, TECH_POOL, TITLES, } from "./catalog-data.js";
export const buildCatalogJobs = () => {
    return Array.from({ length: CATALOG_JOB_COUNT }, (_, index) => {
        const i = index + 1;
        const company = COMPANIES[index % COMPANIES.length];
        const area = AREAS[index % AREAS.length];
        const titles = TITLES[area];
        const title = titles[index % titles.length];
        const seniority = SENIORITIES[Math.floor(index / AREAS.length) % SENIORITIES.length];
        const modality = MODALITIES[Math.floor(index / (AREAS.length * SENIORITIES.length)) % MODALITIES.length];
        const source = SOURCES[index % SOURCES.length];
        const salaryBand = SALARY_BY_SENIORITY[seniority];
        const salaryStep = (index % 5) * 500;
        const salaryMin = salaryBand.min + salaryStep;
        const salaryMax = Math.min(salaryBand.max + salaryStep, salaryBand.max + 2000);
        const techCount = 4 + (index % 4);
        const technologies = Array.from({ length: techCount }, (_, t) => {
            const name = TECH_POOL[(index + t) % TECH_POOL.length];
            return { id: `tech_${i}_${t}`, name, slug: slugify(name) };
        });
        const externalId = `${source}_job_${String(i).padStart(4, "0")}`;
        const publishedDaysAgo = index % 60;
        return {
            id: `job_${String(i).padStart(4, "0")}`,
            userId: null,
            companyName: company.name,
            companySlug: slugify(company.name),
            title,
            slug: slugify(`${title}-${company.name}-${i}`),
            description: `Oportunidade para ${title} na ${company.name}. Trabalhe com ${technologies.map((t) => t.name).join(", ")} em ambiente ${modality}.`,
            sourceUrl: buildSourceUrl(source, externalId),
            source,
            externalId,
            area,
            seniority,
            modality,
            location: modality === "remote" ? "Remoto - Brasil" : company.location,
            salaryMin,
            salaryMax,
            currency: "BRL",
            status: "active",
            isCatalog: true,
            publishedAt: new Date(Date.now() - publishedDaysAgo * 86_400_000),
            metadata: {
                technologies,
                requirements: technologies.map((t) => t.name),
                benefits: ["Plano de saúde", "VR/VA", modality === "remote" ? "Home office" : "Modelo híbrido"],
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
};
//# sourceMappingURL=catalog-jobs.seeder.js.map