import Link from "next/link";
import { FileStack, FileUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/generalUIcomp/States";
import { SectionCard } from "@/components/generalUIcomp/SectionCard";
import { DocumentRow } from "@/components/elements/documents/DocumentRow";
import type { DocumentItem } from "@/types";

/** Recently uploaded files with processing state (§12.11) */
const RecentDocuments = ({ items }: { items: DocumentItem[] }) => (
  <SectionCard title="Recent Documents" icon={FileStack} link={{ href: "/u/documents", label: "Documents" }} className="h-full" bodyClassName="px-0 pb-1">
    {items.length === 0 && (
      <EmptyState compact icon={FileUp} title="No documents yet" description="Upload contracts, briefs and deliverables so your team and AI can use them." action={<Link href="/u/documents" className={buttonVariants({ size: "sm" })}>Go to documents</Link>} />
    )}
    <ul>
      {items.map((d) => (
        <li key={d.id} className="border-t border-border/70 transition-colors hover:bg-muted/40">
          <DocumentRow doc={d} />
        </li>
      ))}
    </ul>
  </SectionCard>
);

export default RecentDocuments;
