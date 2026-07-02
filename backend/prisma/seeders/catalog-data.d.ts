export declare const CATALOG_JOB_COUNT = 400;
export declare const CATALOG_SEED_SKIP_THRESHOLD = 300;
export declare const COMPANIES: readonly [{
    readonly name: "Nubank";
    readonly industry: "Fintech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Stone";
    readonly industry: "Fintech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "iFood";
    readonly industry: "Foodtech";
    readonly location: "Osasco, SP";
}, {
    readonly name: "PicPay";
    readonly industry: "Fintech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Mercado Livre";
    readonly industry: "E-commerce";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Hotmart";
    readonly industry: "Edtech";
    readonly location: "Belo Horizonte, MG";
}, {
    readonly name: "CI&T";
    readonly industry: "Consultoria";
    readonly location: "Campinas, SP";
}, {
    readonly name: "XP Inc.";
    readonly industry: "Fintech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "B3";
    readonly industry: "Financeiro";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Loft";
    readonly industry: "Proptech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "QuintoAndar";
    readonly industry: "Proptech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Magalu";
    readonly industry: "Varejo";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Will Bank";
    readonly industry: "Fintech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "C6 Bank";
    readonly industry: "Fintech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Inter";
    readonly industry: "Fintech";
    readonly location: "Belo Horizonte, MG";
}, {
    readonly name: "VTEX";
    readonly industry: "E-commerce";
    readonly location: "Rio de Janeiro, RJ";
}, {
    readonly name: "Gympass";
    readonly industry: "Wellness";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Creditas";
    readonly industry: "Fintech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Neon";
    readonly industry: "Fintech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Loggi";
    readonly industry: "Logtech";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Wildlife";
    readonly industry: "Games";
    readonly location: "São Paulo, SP";
}, {
    readonly name: "Zup";
    readonly industry: "Consultoria";
    readonly location: "São Paulo, SP";
}];
export declare const AREAS: readonly ["frontend", "backend", "full_stack", "mobile", "devops", "data_engineer"];
export declare const SENIORITIES: readonly ["junior", "mid", "senior", "lead"];
export declare const MODALITIES: readonly ["remote", "hybrid", "onsite"];
export declare const SOURCES: readonly ["gupy", "linkedin", "programathor"];
export declare const TECH_POOL: readonly ["React", "Next.js", "TypeScript", "Node.js", "Python", "Java", "Docker", "AWS", "PostgreSQL", "GraphQL", "Kubernetes", "Terraform", "Vue.js", "Angular", "Go", "Redis", "Kafka", "Tailwind CSS", "React Native", "Flutter", "Django", "Spring Boot", "GCP", "Azure"];
export declare const TITLES: Record<(typeof AREAS)[number], string[]>;
export declare const SALARY_BY_SENIORITY: Record<(typeof SENIORITIES)[number], {
    min: number;
    max: number;
}>;
export declare const slugify: (value: string) => string;
export declare const buildSourceUrl: (source: (typeof SOURCES)[number], externalId: string) => string;
//# sourceMappingURL=catalog-data.d.ts.map