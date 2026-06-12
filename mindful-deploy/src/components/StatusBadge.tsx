import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  issued: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  returned: "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/30",
  active: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  inactive: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("capitalize border", STYLES[status] ?? "")}>
      {status}
    </Badge>
  );
}