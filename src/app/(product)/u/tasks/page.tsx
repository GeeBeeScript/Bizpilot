import TasksPageComp from "@/app/components/pagecomponents/TasksPageComp";
import type { DemoState } from "@/app/components/pagecomponents/DashboardPageComp";
import { currentUser } from "@/lib/mock/people";
import { projects, tasks } from "@/lib/mock/workspace";

export const metadata = { title: "Tasks" };

const TasksPage = async ({ searchParams }: PageProps<"/u/tasks">) => {
  const { state } = await searchParams;
  const myProjectIds = projects
    .filter(
      (p) =>
        p.team.some((m) => m.id === currentUser.id) ||
        p.manager.id === currentUser.id,
    )
    .map((p) => p.id);
  return (
    <TasksPageComp
      tasks={tasks}
      me={currentUser}
      myProjectIds={[...myProjectIds, "customer-portal"]}
      demo={state as DemoState}
    />
  );
};

export default TasksPage;
