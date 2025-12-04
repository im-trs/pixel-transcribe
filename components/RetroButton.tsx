import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const variantStyles = {
  primary: 'bg-retro-blue text-white hover:brightness-110',
  secondary: 'bg-retro-yellow text-black hover:brightness-110',
  danger: 'bg-retro-red text-white hover:brightness-110',
};

export const RetroButton: React.FC<RetroButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  disabled,
  ...props 
}) => {
  return (
    <button
      disabled={disabled}
      className={`
        font-pixel text-xl uppercase font-bold
        px-6 py-3
        border-4 border-black
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
        transition-all duration-100
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
