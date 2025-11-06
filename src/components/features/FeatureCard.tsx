import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Feature } from '@/config/features';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface FeatureCardProps {
  feature: Feature;
  index: number;
  onNavigate: (route: string) => void;
}

const cardVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

const emergencyBadgeVariants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      delay: 0.8,
      type: "spring" as const,
      stiffness: 400,
      damping: 10
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const
    }
  }
};

const FeatureCard = React.memo(({ feature, index, onNavigate }: FeatureCardProps) => {
  const handleClick = React.useCallback(() => {
    // Haptic feedback if available
    if ('vibrate' in navigator && feature.isEmergency) {
      navigator.vibrate([50, 30, 50]);
    }
    onNavigate(feature.route);
  }, [feature.route, feature.isEmergency, onNavigate]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      className={cn(
        "group relative",
        feature.isEmergency && "ring-2 ring-destructive/20 ring-offset-2 ring-offset-background rounded-lg"
      )}
    >
      <Card
        className={cn(
          "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          feature.isEmergency && "bg-gradient-to-br from-destructive/5 to-background border-destructive/20"
        )}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${feature.title}: ${feature.description}. ${feature.isEmergency ? 'Característica de emergencia' : ''}`}
      >
        {/* Emergency Badge */}
        {feature.isEmergency && feature.badge && (
          <motion.div
            variants={emergencyBadgeVariants}
            initial="initial"
            animate={["animate", "pulse"]}
            className="absolute top-4 right-4 z-10"
          >
            <Badge
              variant="destructive"
              className="text-xs font-bold px-2 py-1 animate-pulse shadow-lg"
            >
              {feature.badge}
            </Badge>
          </motion.div>
        )}

        {/* Image Container */}
        <div className="aspect-video bg-muted/50 overflow-hidden">
          <img
            src={feature.image}
            alt={feature.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading={feature.priority === 'high' ? 'eager' : 'lazy'}
            decoding="async"
          />

          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <feature.icon
              className={cn(
                "h-5 w-5 transition-colors duration-300",
                feature.isEmergency
                  ? "text-destructive group-hover:text-destructive/80"
                  : "text-primary group-hover:text-primary/80"
              )}
              aria-hidden="true"
            />
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
              {feature.title}
            </CardTitle>
          </div>
          <VisuallyHidden>
            <p>Navegar a {feature.title}</p>
          </VisuallyHidden>
          <CardDescription className="text-sm leading-relaxed">
            {feature.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <Button
            variant={feature.buttonVariant}
            size="lg"
            className="w-full transition-all duration-300 group-hover:shadow-md"
            aria-describedby={`${feature.id}-description`}
          >
            {feature.buttonText}
          </Button>
          <VisuallyHidden>
            <span id={`${feature.id}-description`}>
              Acceder a la función {feature.title} para {feature.description.toLowerCase()}
            </span>
          </VisuallyHidden>
        </CardContent>
      </Card>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

export { FeatureCard };