import { AdminOrganizations } from "@/app/components/pagecomponents/AdminPages";
import { adminOrgs } from "@/lib/mock/admin";

export const metadata = { title: "Organizations" };

const Page = () => <AdminOrganizations orgs={adminOrgs} />;

export default Page;
