import { PortalProfile } from "@/app/components/pagecomponents/PortalPages";
import { portalViewer } from "@/lib/mock/portal";

export const metadata = { title: "Profile" };

const Page = () => (
  <PortalProfile
    viewer={portalViewer.person}
    company={portalViewer.clientName}
  />
);

export default Page;
