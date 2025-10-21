'use client';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export default function ToggleSwitch({ 
  label, 
  checked, 
  onChange, 
  size = 'md',
  disabled = false,
  className = ''
}: ToggleSwitchProps) {
  // Size configurations
  const sizes = {
    sm: {
      container: 'h-5 w-9',
      knob: 'h-3 w-3',
      translate: checked ? 'translate-x-5' : 'translate-x-1'
    },
    md: {
      container: 'h-7 w-12',
      knob: 'h-5 w-5',
      translate: checked ? 'translate-x-6' : 'translate-x-1'
    },
    lg: {
      container: 'h-9 w-16',
      knob: 'h-7 w-7',
      translate: checked ? 'translate-x-8' : 'translate-x-1'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`text-gray-700 font-medium ${disabled ? 'opacity-50' : ''}`}>
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex ${currentSize.container} items-center rounded-full transition-colors duration-200 ${
          disabled 
            ? 'bg-gray-200 cursor-not-allowed' 
            : checked 
              ? 'bg-green-500' 
              : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block ${currentSize.knob} transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
            currentSize.translate
          }`}
        />
      </button>
    </div>
  );
}