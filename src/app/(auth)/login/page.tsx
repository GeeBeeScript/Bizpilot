import AuthNavigation from "@/app/components/elements/AuthNav";
import LoginSection from "@/app/components/elements/LoginSection";
import React from "react";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { checkCookies } from "@/actions/auth-actions";

export const metadata = { title: "Sign in" };

const LoginPage = async () => {
  const session = await auth();
  await checkCookies()

  console.log(session?.user, session?.user?.name);

  // if (session?.user) redirect("/u/dashboard");

  return (
    <section className="flex flex-col w-screen min-h-screen">
      <AuthNavigation />
      <div className="bg-amber/5 font-noto font-bold flex-1 content-center overflow-y-auto py-6">
        <LoginSection />
      </div>
    </section>
  );
};

export default LoginPage;
