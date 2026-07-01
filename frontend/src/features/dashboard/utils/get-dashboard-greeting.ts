export const getFirstName = (fullName: string): string => fullName.trim().split(/\s+/)[0] ?? fullName;

export const getGreetingPeriod = (date: Date = new Date()): "Bom dia" | "Boa tarde" | "Boa noite" => {
  const hour = date.getHours();

  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

export const buildDashboardGreeting = (name: string, date: Date = new Date()): string =>
  `${getGreetingPeriod(date)}, ${getFirstName(name)} 👋`;
