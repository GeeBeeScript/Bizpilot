import AuthNavigation from "@/app/components/elements/AuthNav";
import OAuthProfileSection from "@/app/components/elements/OAuthProfileSection";

export const metadata = { title: "Complete your profile" };

/** First and last name step for OAuth sign-ups (Google/Microsoft).
 *  UI preview: /signup/complete-profile?email=nia@cornucopia.studio&name=Nia%20Brooks&provider=google */
const CompleteProfilePage = async ({ searchParams }: PageProps<"/signup/complete-profile">) => {
  const { email, name, provider } = await searchParams;
  const [first = "", ...rest] = typeof name === "string" ? name.trim().split(/\s+/) : [];

  return (
    <section className="flex flex-col w-screen min-h-screen">
      <AuthNavigation />
      <div className="bg-amber/5 font-noto font-bold flex-1 content-center overflow-y-auto py-6">
        <OAuthProfileSection
          email={typeof email === "string" ? email : undefined}
          provider={provider === "microsoft" ? "microsoft" : "google"}
          defaultFirst={first}
          defaultLast={rest.join(" ")}
        />
      </div>
    </section>
  );
};

export default CompleteProfilePage;
