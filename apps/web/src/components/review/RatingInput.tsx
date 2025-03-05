"use client";

interface RatingInputProps {
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RatingInput({ name, value, onChange }: RatingInputProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="range"
        name={name}
        min="1"
        max="5"
        step="0.5"
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
