import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  id,
  name,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const uniqueId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: checked ? 'translate-x-4' : 'translate-x-1',
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-4 h-4',
      translate: checked ? 'translate-x-6' : 'translate-x-1',
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-5 h-5',
      translate: checked ? 'translate-x-8' : 'translate-x-1',
    },
  };

  return (
    <div className={`flex ${description ? 'items-start' : 'items-center'} ${className}`}>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          id={uniqueId}
          name={name}
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          onClick={() => !disabled && onChange(!checked)}
          className={`
            ${sizeClasses[size].switch}
            ${checked ? 'bg-[#982a4a]' : 'bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out
          `}
        >
          <span
            className={`
              ${sizeClasses[size].thumb}
              ${sizeClasses[size].translate}
              bg-white rounded-full shadow transform ring-0 transition duration-200 ease-in-out
              pointer-events-none inline-block
            `}
          />
        </div>
      </div>

      {(label || description) && (
        <div className={`ml-3 ${disabled ? 'opacity-50' : ''}`}>
          {label && (
            <label
              htmlFor={uniqueId}
              className={`text-sm font-medium text-gray-900 ${!disabled && 'cursor-pointer'}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};
