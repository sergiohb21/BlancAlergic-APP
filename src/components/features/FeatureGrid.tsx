import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureCard } from './FeatureCard';
import { features } from '@/config/features';
import { cn } from '@/lib/utils';

interface FeatureGridProps {
  className?: string;
  onNavigate: (route: string) => void;
}

const containerVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const gridVariants = {
  initial: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const FeatureGrid = React.memo(({ className, onNavigate }: FeatureGridProps) => {
  // Sort features by priority for better visual hierarchy
  const sortedFeatures = React.useMemo(() => {
    return [...features].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("w-full", className)}
    >
      <motion.div
        variants={gridVariants}
        className={cn(
          "grid gap-6",
          "grid-cols-1",
          "md:grid-cols-2",
          "xl:grid-cols-3"
        )}
      >
        <AnimatePresence>
          {sortedFeatures.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              onNavigate={onNavigate}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

FeatureGrid.displayName = 'FeatureGrid';

export { FeatureGrid };