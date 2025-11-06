import { cva, type VariantProps } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary/80 dark:text-secondary-foreground shadow-sm dark:shadow",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border border-input bg-background/50 text-foreground hover:bg-accent hover:text-accent-foreground dark:border-border/60 dark:bg-background/80 dark:text-foreground/90 dark:hover:bg-accent/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>