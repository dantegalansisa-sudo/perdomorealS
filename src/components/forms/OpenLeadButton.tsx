"use client";
import { openLeadModal } from "@/lib/ui-store";

/** Button usable from server components that opens the global lead modal. */
export function OpenLeadButton({
  type,
  projectId,
  propertyId,
  interest,
  className,
  children,
}: {
  type: "info" | "price" | "visit";
  projectId?: string | null;
  propertyId?: string | null;
  interest?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={() => openLeadModal({ type, projectId, propertyId, interest })} className={className}>
      {children}
    </button>
  );
}
