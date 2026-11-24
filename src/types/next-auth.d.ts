import type { Kind, Roles } from "@/app/generated/prisma/enums"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: { id: string, activeOrgId?: string, role?: Roles, kind?: Kind } & DefaultSession["user"]
    }
}

declare module "@auth/core/jwt" {
    interface JWT { id?: string, activeOrgId?: string, role?: Roles, kind?: Kind, checkedAt: DateTime }
}