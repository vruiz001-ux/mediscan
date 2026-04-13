export function MedicineCounter({ count, max = 10 }: { count: number; max?: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium">{count} of {max}</span>
      <span className="text-muted-foreground">medicines added</span>
    </div>
  );
}
