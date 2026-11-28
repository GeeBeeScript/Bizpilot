import { Roles } from "@/app/generated/prisma/enums"
import { ForbiddenError } from "@/lib/error"

const matrix = {
    "client:create": ["owner", "admin", "manager"],
    "project:create": ["owner", "admin", "manager"],
    "dashboard:view": ["owner", "admin", "manager", "member"],
    "task:edit": ["owner", "admin", "manager", "member"],
    "documents:upload": ["owner", "admin", "manager", "member"],
    "client:invite": ["owner", "admin", "manager"],
    "automation:create": ["owner", "admin", "manager"],
    "report:view": ["owner", "admin", "manager"],
    "aiaction:approve": ["owner", "admin", "manager", "member"],
    "member:manage": ["owner", "admin"],
    "role:manage": ["owner", "admin"],
    "billing:manage": ["owner"],
    "subscription:manage": ["owner"],
    "organization:delete": ["owner"]
} as const satisfies Record<string, readonly Roles[]>

export type Action = keyof typeof matrix

export const can = (role: Roles, action: Action): boolean => {
    return ( 
        (matrix[action] as readonly Roles[])?.includes(role) ?? false
    )
}

export const assertCan = (role: Roles, action: Action) => {
    if (!can(role, action)) throw new ForbiddenError("You are not allowed")
}