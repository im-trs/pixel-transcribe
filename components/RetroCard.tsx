import React from 'react';

interface RetroCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  color?: 'white' | 'blue' | 'yellow' | 'red';
}

const colorMap = {
  white: 'bg-retro-white',
  blue: 'bg-retro-blue',
  yellow: 'bg-retro-yellow',
  red: 'bg-retro-red',
};

export const RetroCard: React.FC<RetroCardProps> = ({ 
  children, 
  title, 
  className = '', 
  color = 'white' 
}) => {
  return (
    <div className={`
      relative 
      border-4 border-black 
      shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
      ${colorMap[color]} 
      p-6 
      ${className}
    `}>
      {title && (
        <div className="absolute -top-5 left-4 bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-pixel text-xl uppercase font-bold text-black">{title}</h3>
        </div>
      )}
      <div className="font-pixel text-lg text-black">
        {children}
      </div>
    </div>
  );
};
