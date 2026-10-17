"use client";
import { useEffect } from "react";
import { pageContext, type PageContextState } from "@/lib/ui-store";

/** Declares page-level context (project, property, locale alternates). Resets on unmount. */
export function PageContext(props: PageContextState) {
  const key = JSON.stringify(props);
  useEffect(() => {
    pageContext.set({ projectId: null, propertyId: null, interest: null, alternates: null, ...props });
    return () => pageContext.set({ projectId: null, propertyId: null, interest: null, alternates: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
