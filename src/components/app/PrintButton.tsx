"use client";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ id }: { id?: string }) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (id) window.open(`/print/${id}`, "_blank");
        else window.print();
      }}
    >
      <Printer className="h-4 w-4" /> Print
    </Button>
  );
}
