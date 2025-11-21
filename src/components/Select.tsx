'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when dropdown is open on mobile
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 hover:bg-gray-700/70 hover:border-blue-500/50 text-left"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`block truncate flex-1 ${!selectedOption ? 'text-gray-400' : 'text-white'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            role="listbox"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              <ul className="py-1">
                {placeholder && (
                  <li
                    className="px-4 py-2.5 text-gray-400 hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                    onClick={() => {
                      onChange('');
                      setIsOpen(false);
                    }}
                    role="option"
                  >
                    {placeholder}
                  </li>
                )}
                {options.length === 0 ? (
                  <li className="px-4 py-2.5 text-gray-400 text-center">No options available</li>
                ) : (
                  options.map((option) => (
                    <li
                      key={option.value}
                      className={`px-4 py-2.5 cursor-pointer transition-colors duration-150 ${
                        option.value === value
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      role="option"
                      aria-selected={option.value === value}
                    >
                      {option.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

