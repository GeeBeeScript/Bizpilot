import { PortalDocuments } from "@/app/components/pagecomponents/PortalPages";
import { portalDocuments } from "@/lib/mock/portal";

export const metadata = { title: "Documents" };

const Page = () => <PortalDocuments docs={portalDocuments} />;

export default Page;
