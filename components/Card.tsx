import React from 'react';
import { View, ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  "bg-turtle-cream-100 rounded-2xl border border-turtle-teal-300",
  {
    variants: {
      variant: {
        default: "shadow-lg shadow-turtle-teal-300/50",
        elevated: "shadow-lg shadow-turtle-teal-300/50",
        flat: "shadow-none border-turtle-teal-300",
        glow: "shadow-lg shadow-turtle-teal-300/50",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      rounded: {
        sm: "rounded-lg",
        md: "rounded-2xl", 
        lg: "rounded-3xl",
        xl: "rounded-4xl",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      rounded: "md",
    },
  }
);

interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  variant,
  padding,
  rounded,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={`${cardVariants({ variant, padding, rounded })} ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}