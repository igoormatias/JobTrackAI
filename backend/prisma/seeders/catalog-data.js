export const CATALOG_JOB_COUNT = 400;
export const CATALOG_SEED_SKIP_THRESHOLD = 300;
export const COMPANIES = [
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
    { name: "Will Bank", industry: "Fintech", location: "São Paulo, SP" },
    { name: "C6 Bank", industry: "Fintech", location: "São Paulo, SP" },
    { name: "Inter", industry: "Fintech", location: "Belo Horizonte, MG" },
    { name: "VTEX", industry: "E-commerce", location: "Rio de Janeiro, RJ" },
    { name: "Gympass", industry: "Wellness", location: "São Paulo, SP" },
    { name: "Creditas", industry: "Fintech", location: "São Paulo, SP" },
    { name: "Neon", industry: "Fintech", location: "São Paulo, SP" },
    { name: "Loggi", industry: "Logtech", location: "São Paulo, SP" },
    { name: "Wildlife", industry: "Games", location: "São Paulo, SP" },
    { name: "Zup", industry: "Consultoria", location: "São Paulo, SP" },
];
export const AREAS = [
    "frontend",
    "backend",
    "full_stack",
    "mobile",
    "devops",
    "data_engineer",
];
export const SENIORITIES = ["junior", "mid", "senior", "lead"];
export const MODALITIES = ["remote", "hybrid", "onsite"];
export const SOURCES = ["gupy", "linkedin", "programathor"];
export const TECH_POOL = [
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
    "Kubernetes",
    "Terraform",
    "Vue.js",
    "Angular",
    "Go",
    "Redis",
    "Kafka",
    "Tailwind CSS",
    "React Native",
    "Flutter",
    "Django",
    "Spring Boot",
    "GCP",
    "Azure",
];
export const TITLES = {
    frontend: ["Frontend Engineer", "React Developer", "UI Engineer", "Web Developer"],
    backend: ["Backend Engineer", "Node.js Developer", "Java Developer", "API Engineer"],
    full_stack: ["Full Stack Engineer", "Software Engineer", "Product Engineer"],
    mobile: ["Mobile Developer", "React Native Engineer", "Android Developer"],
    devops: ["DevOps Engineer", "SRE", "Platform Engineer"],
    data_engineer: ["Data Engineer", "Analytics Engineer", "BI Engineer"],
};
export const SALARY_BY_SENIORITY = {
    junior: { min: 4000, max: 8000 },
    mid: { min: 7000, max: 12000 },
    senior: { min: 11000, max: 18000 },
    lead: { min: 15000, max: 25000 },
};
export const slugify = (value) => value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
export const buildSourceUrl = (source, externalId) => {
    switch (source) {
        case "gupy":
            return `https://portal.gupy.io/job/${externalId}`;
        case "linkedin":
            return `https://www.linkedin.com/jobs/view/${externalId}`;
        case "programathor":
            return `https://programathor.com.br/jobs/${externalId}`;
        default:
            return `https://example.com/jobs/${externalId}`;
    }
};
//# sourceMappingURL=catalog-data.js.map