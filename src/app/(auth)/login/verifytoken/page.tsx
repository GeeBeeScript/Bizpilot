import VerifyTokenPageComp from "@/app/components/pagecomponents/VerifyTokenPage";
import React from "react";

export const metadata = { title: "Verify your email" };

const VerifyTokenLoginPage = async ({
  searchParams,
}: PageProps<"/login/verifytoken">) => {
  const { email } = await searchParams;
  return (
    <section>
      <VerifyTokenPageComp
        email={typeof email === "string" ? email : undefined}
        flow="login"
      />
    </section>
  );
};

export default VerifyTokenLoginPage;
