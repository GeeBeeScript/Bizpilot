import InviteLandingComp, { type InvitePermission } from "@/app/components/pagecomponents/InviteLandingComp";
import { getInvite } from "@/lib/mock/invites";
import { rolePermissions } from "@/lib/mock/organization";
import { expiresLabel } from "@/lib/date";
import type { InviteState } from "@/types";

export const metadata = { title: "You're invited" };

const demoStates: InviteState[] = ["expired", "accepted", "revoked"];

/** Shareable invite links land here: /invite/team-7f3k2 · /invite/client-globex · /invite/contact-umbrella
 *  Demo the other states with ?state=expired|accepted|revoked */
const InvitePage = async ({ params, searchParams }: PageProps<"/invite/[token]">) => {
  const { token } = await params;
  const { state } = await searchParams;
  const found = getInvite(token);
  const invite =
    found && typeof state === "string" && demoStates.includes(state as InviteState)
      ? { ...found, state: state as InviteState }
      : found;

  const permissions: InvitePermission[] | undefined =
    invite?.kind === "team" && invite.role
      ? rolePermissions.map((p) => ({ label: p.feature, allowed: p[invite.role!] }))
      : undefined;

  return (
    <InviteLandingComp
      invite={invite}
      token={token}
      expires={invite ? expiresLabel(invite.expiresAt) : undefined}
      permissions={permissions}
    />
  );
};

export default InvitePage;
