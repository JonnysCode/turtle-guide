import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'bg-chalk/50 rounded-xl border font-inter text-earie-black transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-blue-glass focus:border-royal-palm',
        error: 'border-red-400 bg-red-50/50',
        success: 'border-royal-palm bg-blue-glass'
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

interface InputProps extends TextInputProps, VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

export default function Input({
                                label,
                                error,
                                rightIcon,
                                isPassword = false,
                                variant = 'default',
                                size = 'md',
                                containerClassName = '',
                                inputClassName = '',
                                secureTextEntry,
                                ...textInputProps
                              }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = isPassword ? !showPassword : secureTextEntry;
  const inputVariant = error ? 'error' : variant;

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-earie-black font-inter-semibold mb-2">
          {label}
        </Text>
      )}

      <View className="relative">
        <TextInput
          {...textInputProps}
          secureTextEntry={isSecure}
          className={`
            ${inputVariants({ variant: inputVariant, size })}
            ${(isPassword || rightIcon) ? 'pr-12' : ''}
            ${inputClassName}
          `}
          style={{
            height: size === 'sm' ? 40 : size === 'lg' ? 56 : 48,
            textAlignVertical: 'center',
            lineHeight: 20,
            paddingVertical: 0
          }}
        />

        {/* Password toggle or custom right icon */}
        {isPassword && (
          <TouchableOpacity
            onPress={handleTogglePassword}
            className="absolute right-4 w-6 h-6 items-center justify-center"
            style={{ top: (size === 'sm' ? 40 : size === 'lg' ? 56 : 48) / 2 - 12 }}
          >
            {showPassword ? (
              <EyeOff size={20} color="#64748B" />
            ) : (
              <Eye size={20} color="#64748B" />
            )}
          </TouchableOpacity>
        )}

        {!isPassword && rightIcon && (
          <View
            className="absolute right-4"
            style={{ top: (size === 'sm' ? 40 : size === 'lg' ? 56 : 48) / 2 - 12 }}
          >
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <Text className="text-red-500 font-inter text-sm mt-2">
          {error}
        </Text>
      )}
    </View>
  );
}