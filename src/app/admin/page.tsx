import { AdminOverview } from "@/app/components/pagecomponents/AdminPages";
import * as A from "@/lib/mock/admin";

const AdminPage = () => (
  <AdminOverview
    kpis={A.platformKpis}
    mrrTrend={A.mrrTrend}
    aiDaily={A.aiDaily}
    activity={A.orgActivity}
    signups={A.recentSignups}
    subscriptions={A.subscriptionEvents}
    health={A.aiHealth}
    failed={A.failedOps}
  />
);

export default AdminPage;
