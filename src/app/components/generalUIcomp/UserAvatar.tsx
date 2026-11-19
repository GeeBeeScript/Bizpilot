import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

type UserAvatarProps = {
  person: Person;
  size?: "sm" | "default" | "lg";
  showStatus?: boolean;
  className?: string;
};

/** Internal people get the brand blue fallback; external collaborators get a gold ring + tint */
export const UserAvatar = ({
  person,
  size = "sm",
  showStatus,
  className,
}: UserAvatarProps) => (
  <Avatar
    size={size}
    className={cn(
      person.external && "ring-2 ring-ai/60 ring-offset-1 ring-offset-card",
      className,
    )}
    title={
      person.external
        ? `${person.name} — ${person.external.company} — External collaborator`
        : person.name
    }
  >
    {person.avatarUrl && (
      <AvatarImage src={person.avatarUrl} alt={person.name} />
    )}
    <AvatarFallback
      className={cn(
        "font-semibold text-[0.65rem]",
        person.external
          ? "bg-ai/20 text-heading"
          : "bg-primary-blue text-white",
      )}
    >
      {person.initials}
    </AvatarFallback>
    {showStatus && person.online && <AvatarBadge className="bg-success" />}
  </Avatar>
);

export const AvatarStack = ({
  people,
  max = 3,
}: {
  people: Person[];
  max?: number;
}) => (
  <div className="flex -space-x-1 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-card">
    {people.slice(0, max).map((p) => (
      <UserAvatar key={p.id} person={p} />
    ))}
    {people.length > max && (
      <span className="z-10 grid size-6 place-items-center rounded-full bg-muted text-[0.65rem] font-medium text-muted-foreground ring-2 ring-card">
        +{people.length - max}
      </span>
    )}
  </div>
);

export const PersonLabel = ({
  person,
  subtitle,
}: {
  person: Person;
  subtitle?: string;
}) => (
  <span className="flex min-w-0 items-center gap-2">
    <UserAvatar person={person} />
    <span className="min-w-0">
      <span className="block truncate text-sm text-foreground">
        {person.name}
      </span>
      {subtitle && (
        <span className="block truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      )}
    </span>
  </span>
);
