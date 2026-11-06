// Report series. Replace with your analytics endpoints; shapes are what the charts consume.

export const revenueTrend = [
  { month: "Nov", revenue: 48200 }, { month: "Dec", revenue: 51900 }, { month: "Jan", revenue: 49400 },
  { month: "Feb", revenue: 53800 }, { month: "Mar", revenue: 58100 }, { month: "Apr", revenue: 56300 },
  { month: "May", revenue: 61200 }, { month: "Jun", revenue: 64800 }, { month: "Jul", revenue: 63100 },
  { month: "Aug", revenue: 66900 }, { month: "Sep", revenue: 68750 }, { month: "Oct", revenue: 67858 },
];

export const revenueByClient = [
  { id: "globex", name: "Globex Corporation", value: 21400 },
  { id: "umbrella", name: "Umbrella Health", value: 14200 },
  { id: "acme", name: "Acme Retail", value: 11900 },
  { id: "initech", name: "Initech", value: 8600 },
  { id: "nipe", name: "Nipe Corporation", value: 7258 },
  { id: "gale", name: "Gale Logistics", value: 4500 },
];

export const revenueByProject = [
  { id: "customer-portal", name: "Customer Portal", client: "Globex Corporation", value: 16900, margin: 31 },
  { id: "patient-intake", name: "Patient Intake Redesign", client: "Umbrella Health", value: 14200, margin: 27 },
  { id: "storefront", name: "Storefront Platform", client: "Acme Retail", value: 11900, margin: 12 },
  { id: "data-migration", name: "Data Warehouse Migration", client: "Initech", value: 8600, margin: 38 },
  { id: "tracking-invoicing", name: "Tracking & Invoicing", client: "Nipe Corporation", value: 7258, margin: 34 },
];

export const clientStats = { active: 24, new: 3, inactive: 2, atRisk: 4 };

export const newClientsByMonth = [
  { month: "May", clients: 1 }, { month: "Jun", clients: 2 }, { month: "Jul", clients: 1 },
  { month: "Aug", clients: 3 }, { month: "Sep", clients: 2 }, { month: "Oct", clients: 3 },
];

export const projectBudgets = [
  { id: "customer-portal", name: "Customer Portal", budget: 120000, spent: 81000 },
  { id: "storefront", name: "Storefront", budget: 90000, spent: 74000 },
  { id: "patient-intake", name: "Patient Intake", budget: 70000, spent: 30000 },
  { id: "data-migration", name: "Data Migration", budget: 64000, spent: 49000 },
  { id: "tracking-invoicing", name: "Tracking & Inv.", budget: 58000, spent: 12000 },
];

export const projectStats = { completionRate: 87, onTime: 9, delayed: 3, avgDelayDays: 4.5 };

export const teamWorkload = [
  { id: "u-james", name: "James Okafor", workload: 112, overdue: 1, completed: 14 },
  { id: "u-priya", name: "Priya Nair", workload: 96, overdue: 1, completed: 11 },
  { id: "u-daniel", name: "Daniel Pim", workload: 88, overdue: 1, completed: 9 },
  { id: "u-sarah", name: "Sarah Chen", workload: 82, overdue: 1, completed: 12 },
  { id: "u-alex", name: "Alex Morgan", workload: 74, overdue: 0, completed: 16 },
  { id: "u-maya", name: "Maya Lopez", workload: 58, overdue: 0, completed: 7 },
  { id: "u-tom", name: "Tom Becker", workload: 46, overdue: 0, completed: 10 },
];

export const aiGenerationsByWeek = [
  { week: "W33", generations: 412 }, { week: "W34", generations: 468 }, { week: "W35", generations: 501 },
  { week: "W36", generations: 553 }, { week: "W37", generations: 618 }, { week: "W38", generations: 590 },
  { week: "W39", generations: 674 }, { week: "W40", generations: 731 },
];

export const aiStats = { generations: 4547, credits: 6800, estimatedCost: 41.2, acceptanceRate: 78 };
