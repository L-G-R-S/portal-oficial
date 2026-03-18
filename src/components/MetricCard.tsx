import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  className 
}: MetricCardProps) {
  return (
    <Card className={cn(
      "p-4 bg-card border shadow-sm",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {trend && (
              <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}