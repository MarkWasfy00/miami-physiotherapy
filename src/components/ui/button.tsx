import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-200 outline-none select-none touch-manipulation focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-brand-700/30",
        secondary:
          "bg-secondary text-secondary-foreground shadow-lg shadow-lime-500/25 hover:bg-lime-400",
        outline:
          "border-border bg-background text-foreground hover:border-brand-300 hover:text-brand-700 aria-expanded:border-brand-300",
        glass:
          "border-white/25 bg-white/10 text-white hover:bg-white/20",
        whatsapp: "bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25 hover:bg-[#1fb457]",
        ghost:
          "text-ink/75 hover:bg-muted hover:text-brand-700 aria-expanded:bg-muted",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 gap-1.5 px-4 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-13 px-7 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
