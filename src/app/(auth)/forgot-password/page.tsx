import AuthNavigation from "@/app/components/elements/AuthNav";
import { ForgotPasswordSection } from "@/app/components/elements/PasswordResetSection";
import React from "react";

export const metadata = { title: "Reset password" };

const Page = () => {
  return (
    <section className="flex flex-col w-screen min-h-screen">
      <AuthNavigation />
      <div className="bg-amber/5 font-noto font-bold flex-1 content-center overflow-y-auto py-6">
        <ForgotPasswordSection />
      </div>
    </section>
  );
};

export default Page;
