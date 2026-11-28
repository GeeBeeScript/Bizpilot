import OnboardingComp from "@/app/components/pagecomponents/OnboardingComp";
import { auth } from "../../../auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { authPaths, paths, productPaths } from "../paths";

export const metadata = { title: "Set up your workspace" };

const OnboardingPage = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(authPaths.signupPage())
  }
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id }
  })
  if (!user) {
    redirect(authPaths.signupPage())
  }
  // if (user.isOnboardCompleted) {
  //   redirect(paths.product.productPage())
  // }
  return <OnboardingComp firstName={session?.user?.name ?? ""} />;
};

export default OnboardingPage;
