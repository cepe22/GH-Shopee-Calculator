import React from 'react';
import { HelpCircle } from 'lucide-react';

export const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
    <Icon className="w-5 h-5 text-orange-600" />
    <h3 className="font-semibold text-gray-800">{title}</h3>
  </div>
);

interface InputGroupProps {
  label: string;
  tooltip?: string;
  children?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const InputGroup = ({ label, tooltip, children, rightElement }: InputGroupProps) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {tooltip && (
          <div className="group relative">
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs p-2 rounded z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {rightElement}
    </div>
    {children}
  </div>
);

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export const NumberInput = ({ value, onChange, prefix, suffix, placeholder }: NumberInputProps) => (
  <div className="flex items-center w-full rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 overflow-hidden transition-colors">
    {prefix && (
      <div className="pl-3 flex items-center pointer-events-none select-none">
        <span className="text-gray-500 sm:text-sm whitespace-nowrap">{prefix}</span>
      </div>
    )}
    <input
      type="number"
      value={value === 0 ? '' : value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder || '0'}
      className={`block w-full min-w-0 flex-1 border-0 bg-transparent py-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm ${prefix ? 'pl-2' : 'pl-3'} ${suffix ? 'pr-2' : 'pr-3'}`}
    />
    {suffix && (
      <div className="pr-3 flex items-center pointer-events-none select-none">
        <span className="text-gray-500 sm:text-sm whitespace-nowrap">{suffix}</span>
      </div>
    )}
  </div>
);

export const Toggle = ({ labelLeft, labelRight, isRight, onChange }: { labelLeft: string, labelRight: string, isRight: boolean, onChange: (val: boolean) => void }) => (
  <div className="flex bg-gray-100 rounded-lg p-1 text-xs font-medium">
    <button
      type="button"
      onClick={() => onChange(false)}
      className={`flex-1 py-1 px-2 rounded-md transition-all ${!isRight ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {labelLeft}
    </button>
    <button
      type="button"
      onClick={() => onChange(true)}
      className={`flex-1 py-1 px-2 rounded-md transition-all ${isRight ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {labelRight}
    </button>
  </div>
);