'use client';

import React, { useState, useEffect } from 'react'; // Removed unused useCallback
import { Input } from '@/components/ui/input'; // Import Input

import { Slider } from '@/components/ui/slider'
import { List } from 'lucide-react' // Keep List for the "All" button icon

interface PriceFilterProps {
  price: string;
  maxPrice: number;
  onPriceRangeChange: (priceRange: string) => void; // Callback to update parent state
}

export function PriceFilter({ price, maxPrice, onPriceRangeChange }: PriceFilterProps) {

  // Initialize state based on price prop or defaults
  const initialValues: [number, number] = price !== 'all'
    ? price.split('-').map(Number) as [number, number]
    : [1, maxPrice];

  const [minValue, setMinValue] = useState<number | string>(initialValues[0]);
  const [maxValue, setMaxValue] = useState<number | string>(initialValues[1]);
  const [sliderValue, setSliderValue] = useState<[number, number]>(initialValues);

  // Update state if price prop changes externally
  useEffect(() => {
    const currentValues: [number, number] = price !== 'all'
      ? price.split('-').map(Number) as [number, number]
      : [1, maxPrice];
    setMinValue(currentValues[0]);
    setMaxValue(currentValues[1]);
    setSliderValue(currentValues);
  }, [price, maxPrice]);

  // Call the callback to update parent state
  const updatePriceRange = (min: number, max: number) => {
    // Prevent updating if values haven't actually changed if they are not 'all'
    if (price !== 'all' && min === initialValues[0] && max === initialValues[1]) {
      // Check against initialValues derived from price prop to avoid redundant updates
      // when component mounts or price prop changes but results in same min/max
      const currentPriceMinMax = price.split('-').map(Number);
      if (min === currentPriceMinMax[0] && max === currentPriceMinMax[1]) return;
    }
    // Prevent updating if it's already 'all' and new values are default 'all'
    if (price === 'all' && min === 1 && max === maxPrice) return;

    onPriceRangeChange(`${min}-${max}`); // Call callback
  };

  const validateAndApplyPriceChange = (newMinInput: number | string, newMaxInput: number | string) => {
    let validatedMin = typeof newMinInput === 'string' || isNaN(Number(newMinInput)) ? 1 : Number(newMinInput);
    let validatedMax = typeof newMaxInput === 'string' || isNaN(Number(newMaxInput)) ? maxPrice : Number(newMaxInput);

    validatedMin = Math.max(1, validatedMin);
    validatedMax = Math.min(maxPrice, validatedMax);

    // Ensure min is not greater than max. Adjust based on which input likely changed.
    // This logic can be refined based on UX preference (e.g., which value takes precedence)
    if (validatedMin > validatedMax) {
      // If newMinInput was the one being actively changed and it caused the issue
      if (newMinInput === minValue && newMaxInput !== maxValue) { // Max was changed
        validatedMin = validatedMax;
      } else { // Min was changed or both were set programmatically
        validatedMax = validatedMin;
      }
    }
    
    setMinValue(validatedMin);
    setMaxValue(validatedMax);
    setSliderValue([validatedMin, validatedMax]);
    updatePriceRange(validatedMin, validatedMax);
  };
  
  // Update URL when slider values commit (on release) - still useful for accessibility and explicit commit
  const handleSliderCommit = (value: number[]) => {
    const newMin = value[0];
    const newMax = value[1];
    // Call validateAndApplyPriceChange to ensure consistency and update parent
    validateAndApplyPriceChange(newMin, newMax);
  };

  // Update state and URL when input values change
  const handleInputChange = (type: 'min' | 'max', value: string) => {
    const numericValue = value === '' ? '' : Number(value); // Keep empty string to allow clearing
    if (type === 'min') {
      setMinValue(numericValue); // Update the input field immediately
      validateAndApplyPriceChange(numericValue, maxValue);
    } else {
      setMaxValue(numericValue); // Update the input field immediately
      validateAndApplyPriceChange(minValue, numericValue);
    }
  };

  // Update URL when input fields lose focus (onBlur) - for sanitization
  const handleInputBlur = () => {
    // Ensure that if an input is left empty or invalid, it gets validated.
    validateAndApplyPriceChange(minValue, maxValue);
  };

  // Update slider visual state, input fields, and URL immediately while dragging
  const handleSliderValueChange = (value: [number, number]) => {
    setMinValue(value[0]);
    setMaxValue(value[1]);
    setSliderValue(value); // Keep slider visually responsive
    updatePriceRange(value[0], value[1]); // Update parent state in real-time
  };

  return (
    <div className='space-y-5'>
      {/* "All" Button */}
      <button
        className={`flex items-center gap-2 p-2.5 rounded-full transition-all duration-200 ${
          'all' === price 
            ? 'bg-primary/10 text-primary font-medium shadow-sm' 
            : 'text-foreground hover:bg-gray-100'
        } w-full text-left`}
        onClick={() => onPriceRangeChange('all')}
      >
        <List className='h-4 w-4' />
        <span className="font-medium">All Price Ranges</span>
      </button>

      {/* Price Range Display */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">
          Current Range: 
          <span className="text-primary ml-1">
            ${typeof minValue === 'string' ? '0' : minValue} - ${typeof maxValue === 'string' ? maxPrice : maxValue}
          </span>
        </div>
      </div>

      {/* Slider */}
      <Slider
        min={1}
        max={maxPrice}
        step={1}
        value={sliderValue}
        onValueChange={handleSliderValueChange}
        onValueCommit={handleSliderCommit}
        className='py-3'
      />

      {/* Min/Max Input Fields */}
      <div className='flex items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className='text-sm font-medium text-gray-500'>$</span>
          </div>
          <Input
            type='number'
            min={1}
            max={maxPrice}
            value={minValue}
            onChange={(e) => handleInputChange('min', e.target.value)}
            onBlur={handleInputBlur}
            className='h-10 pl-7 text-sm rounded-full border-gray-200 shadow-sm focus:border-primary/30 focus:ring focus:ring-primary/20'
            aria-label='Minimum price'
            placeholder="Min"
          />
        </div>
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
          <span className='text-gray-500 text-xs font-medium'>to</span>
        </div>
        <div className='relative flex-1'>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className='text-sm font-medium text-gray-500'>$</span>
          </div>
          <Input
            type='number'
            min={1}
            max={maxPrice}
            value={maxValue}
            onChange={(e) => handleInputChange('max', e.target.value)}
            onBlur={handleInputBlur}
            className='h-10 pl-7 text-sm rounded-full border-gray-200 shadow-sm focus:border-primary/30 focus:ring focus:ring-primary/20'
            aria-label='Maximum price'
            placeholder="Max"
          />
        </div>
      </div>
    </div>
  )
}