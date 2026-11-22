import { Role } from ".";

declare module "next-auth" {
    interface Session {
        user: { id: string, activeOrgId?: string, role?: Role, kind?: Kind } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT { id?: string, activeOrgId?: string, role?: Role, kind?: Kind }
}