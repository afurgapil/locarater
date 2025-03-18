"use client";

interface RatingInputProps {
  name: string;
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
  label?: string;
  isRequired?: boolean;
}

export function RatingInput({
  name,
  value,
  onChange,
  maxValue = 10,
  label,
  isRequired = false,
}: RatingInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <input
          type="range"
          name={name}
          min="1"
          max={maxValue.toString()}
          step="0.5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          inputMode="numeric"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
