import { AIQuality } from "@/app/components/pagecomponents/AdminPages";
import { aiQualityKpis, generations } from "@/lib/mock/admin";

export const metadata = { title: "AI quality" };

const Page = () => <AIQuality kpis={aiQualityKpis} rows={generations} />;

export default Page;
