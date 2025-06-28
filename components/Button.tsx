import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-2xl transition-all duration-200 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-royal-palm shadow-lg",
        secondary: "bg-blue-glass shadow-md",
        outline: "border-2 border-royal-palm bg-chalk",
        ghost: "bg-transparent",
        success: "bg-royal-palm shadow-md",
        warning: "bg-tropical-indigo shadow-md",
        danger: "bg-red-400 shadow-md",
      },
      size: {
        sm: "px-4 py-2 min-h-[40px]",
        md: "px-6 py-3 min-h-[48px]",
        lg: "px-8 py-4 min-h-[56px]",
        xl: "px-10 py-5 min-h-[64px]",
      },
      rounded: {
        normal: "rounded-2xl",
        full: "rounded-full",
        lg: "rounded-3xl",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "normal",
    },
  }
);

const textVariants = cva(
  "font-inter-semibold text-center",
  {
    variants: {
      variant: {
        primary: "text-chalk",
        secondary: "text-earie-black", 
        outline: "text-royal-palm",
        ghost: "text-earie-black",
        success: "text-chalk",
        warning: "text-chalk",
        danger: "text-white",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onPress?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  textClassName?: string;
}

export default function Button({
  variant,
  size,
  rounded,
  onPress,
  children,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${buttonVariants({ variant, size, rounded })}
        ${isDisabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? '#14B8A6' : 'white'} 
          size="small" 
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`${textVariants({ variant, size })} ${textClassName || ''}`}>
            {children}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}