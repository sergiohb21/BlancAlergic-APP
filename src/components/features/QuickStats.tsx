import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Database, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'destructive' | 'secondary';
}

interface QuickStatsProps {
  className?: string;
}

const stats: StatItem[] = [
  {
    id: 'allergies-count',
    value: '29+',
    label: 'Alergias Registradas',
    icon: Shield,
    color: 'destructive'
  },
  {
    id: 'categories-count',
    value: '9',
    label: 'Categorías',
    icon: Database,
    color: 'primary'
  },
  {
    id: 'active-monitoring',
    value: '24/7',
    label: 'Monitoreo Activo',
    icon: Activity,
    color: 'secondary'
  }
];

const containerVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8,
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const statVariants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4
    }
  }
};

const colorClasses = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  destructive: 'text-destructive bg-destructive/10 border-destructive/20',
  secondary: 'text-muted-foreground bg-muted/50 border-border'
};

const QuickStats = React.memo(({ className }: QuickStatsProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn("w-full", className)}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              variants={statVariants}
              custom={index}
            >
              <Card className={cn(
                "text-center p-6 transition-all duration-300 hover:shadow-md hover:scale-105",
                "border-2",
                colorClasses[stat.color]
              )}>
                <CardContent className="p-0">
                  <div className="flex flex-col items-center space-y-3">
                    <div className={cn(
                      "p-3 rounded-full",
                      stat.color === 'primary' && "bg-primary/20",
                      stat.color === 'destructive' && "bg-destructive/20",
                      stat.color === 'secondary' && "bg-muted"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className={cn(
                        "text-3xl font-bold",
                        stat.color === 'primary' && "text-primary",
                        stat.color === 'destructive' && "text-destructive",
                        stat.color === 'secondary' && "text-foreground"
                      )}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
});

QuickStats.displayName = 'QuickStats';

export { QuickStats };