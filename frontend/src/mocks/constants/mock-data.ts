export const KNOWN_COMPANIES = [
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

export const PROFESSIONAL_AREAS = [
  "frontend",
  "backend",
  "full_stack",
  "mobile",
  "qa",
  "devops",
  "product_owner",
  "product_manager",
  "scrum_master",
  "ux_ui",
  "data_engineer",
  "data_analyst",
  "tech_lead",
  "business_analyst",
  "agile_coach",
  "other",
] as const;

export const SENIORITIES = ["intern", "junior", "mid", "senior", "lead", "staff"] as const;

export const MODALITIES = ["remote", "hybrid", "onsite"] as const;

export const PIPELINE_STAGES = [
  "discovery",
  "applied",
  "hr",
  "technical_interview",
  "manager",
  "client",
  "technical_test",
  "offer",
  "hired",
  "closed",
] as const;

export const PIPELINE_STAGE_LABELS: Record<(typeof PIPELINE_STAGES)[number], string> = {
  discovery: "Descoberta",
  applied: "Aplicada",
  hr: "Triagem RH",
  technical_interview: "Entrevista Técnica",
  manager: "Entrevista Gestor",
  client: "Entrevista Cliente",
  technical_test: "Teste Técnico",
  offer: "Oferta",
  hired: "Contratada",
  closed: "Encerrada",
};

export const PIPELINE_INTERVIEW_STAGES = [
  "hr",
  "technical_interview",
  "manager",
  "client",
  "technical_test",
] as const satisfies readonly (typeof PIPELINE_STAGES)[number][];

export const TECHNOLOGIES = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "Docker",
  "Kubernetes",
  "AWS",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Kafka",
  "GraphQL",
  "Tailwind CSS",
  "Vue.js",
  "Angular",
  "Flutter",
  "React Native",
  "Jest",
  "Cypress",
  "Terraform",
  "GitHub Actions",
  "Figma",
  "Power BI",
  "Spark",
  "Airflow",
] as const;

export const JOB_TITLES_BY_AREA: Record<(typeof PROFESSIONAL_AREAS)[number], string[]> = {
  frontend: ["Desenvolvedor Frontend", "Frontend Engineer", "React Developer", "UI Engineer"],
  backend: ["Desenvolvedor Backend", "Backend Engineer", "Java Developer", "Node.js Developer"],
  full_stack: ["Desenvolvedor Full Stack", "Full Stack Engineer", "Software Engineer Pleno"],
  qa: ["Analista de QA", "QA Engineer", "Quality Assurance Analyst", "Test Automation Engineer"],
  devops: ["DevOps Engineer", "SRE", "Platform Engineer", "Cloud Engineer"],
  product_owner: ["Product Owner", "PO Digital", "Product Owner Sr"],
  product_manager: ["Product Manager", "PM de Produto", "Group Product Manager"],
  scrum_master: ["Scrum Master", "Agile Coach", "Scrum Master Sr"],
  ux_ui: ["UX Designer", "UI Designer", "Product Designer", "UX/UI Designer"],
  data_engineer: ["Data Engineer", "Engenheiro de Dados", "Analytics Engineer"],
  data_analyst: ["Data Analyst", "Analista de Dados", "Business Intelligence Analyst"],
  tech_lead: ["Tech Lead", "Engineering Lead", "Lead Developer"],
  mobile: ["Desenvolvedor Mobile", "Mobile Engineer", "React Native Developer", "iOS Developer"],
  business_analyst: ["Business Analyst", "Analista de Negócios", "BA Digital"],
  agile_coach: ["Agile Coach", "Coach Ágil", "Agile Specialist"],
  other: ["Analista de Sistemas", "Consultor de TI", "Especialista de Produto"],
};

export const MATCH_REASONS = [
  "React",
  "Next.js",
  "TypeScript",
  "Remoto",
  "Pretensão compatível",
  "Senioridade alinhada",
  "Stack principal",
  "Localização compatível",
] as const;

export const MISSING_SKILLS = ["Docker", "AWS", "Kafka", "Kubernetes", "GraphQL", "Terraform"] as const;
