import React from 'react';

interface InputProps {
  label: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ label, type, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
    />
  </div>
);

export default Input;
