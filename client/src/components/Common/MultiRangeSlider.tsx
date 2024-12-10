import { useCallback, useEffect, useState, useRef } from 'react';

const MultiRangeSlider: React.FC<{
  className?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: { min: number; max: number }) => void;
}> = ({ className, min, max, step = 1, onChange }) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);

  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);

  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);

  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max],
  );

  const updateRangeStyle = useCallback(() => {
    if (range.current && minValRef.current && maxValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(+maxValRef.current.value);

      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [getPercent]);

  useEffect(() => {
    updateRangeStyle();
  }, [minVal, maxVal, updateRangeStyle]);

  useEffect(() => {
    onChange({ min: minVal, max: maxVal });
  }, [minVal, maxVal, onChange]);

  const handleMinChange = (value: number) => {
    const clampedValue = Math.min(value, maxVal - step);
    setMinVal(clampedValue);
  };

  const handleMaxChange = (value: number) => {
    const clampedValue = Math.max(value, minVal + step);
    setMaxVal(clampedValue);
  };

  const handleMouseDown = (type: 'min' | 'max') => {
    if (type === 'min') {
      setIsDraggingMin(true);
    } else {
      setIsDraggingMax(true);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingMin || isDraggingMax) {
        const rangeRect = range.current?.getBoundingClientRect();
        if (rangeRect) {
          const mouseX = e.clientX;
          const offset = mouseX - rangeRect.left;
          const newPercent = (offset / rangeRect.width) * 100;
          const newValue = Math.min(
            max,
            Math.max(min, min + (newPercent / 100) * (max - min)),
          );

          if (isDraggingMin) {
            setMinVal(newValue);
          } else if (isDraggingMax) {
            setMaxVal(newValue);
          }
        }
      }
    },
    [isDraggingMin, isDraggingMax, max, min],
  );

  const handleMouseUp = () => {
    setIsDraggingMin(false);
    setIsDraggingMax(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingMin, isDraggingMax, handleMouseMove]);

  return (
    <div className={`relative ${className || ''}`}>
      <input
        type="range"
        ref={minValRef}
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={(e) => handleMinChange(+e.target.value)}
        className="absolute pointer-events-none appearance-none z-20 h-2 w-full opacity-0 cursor-pointer"
      />

      <input
        type="range"
        ref={maxValRef}
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={(e) => handleMaxChange(+e.target.value)}
        className="absolute pointer-events-none appearance-none z-20 h-2 w-full opacity-0 cursor-pointer"
      />

      <div className="relative z-10 h-2">
        <div className="absolute z-10 left-0 right-0 top-0 bottom-0 rounded-md bg-gray-200"></div>
        <div
          ref={range}
          className="absolute z-20 top-0 bottom-0 rounded-md bg-green-300"
        ></div>
        <div
          style={{ left: `${getPercent(minVal)}%` }}
          className="absolute z-30 w-4 h-4 top-0 bg-green-300 rounded-full -mt-1 -ml-2 cursor-pointer"
          onMouseDown={() => handleMouseDown('min')}
        ></div>
        <div
          style={{ left: `${getPercent(maxVal)}%` }}
          className="absolute z-30 w-4 h-4 top-0 bg-green-300 rounded-full -mt-1 -ml-2 cursor-pointer"
          onMouseDown={() => handleMouseDown('max')}
        ></div>
      </div>

      <div className="flex justify-between items-center mt-5">
        <input
          type="number"
          min={min}
          max={max}
          value={minVal}
          onChange={(e) => handleMinChange(+e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded w-24 text-center"
        />

        <input
          type="number"
          min={min}
          max={max}
          value={maxVal}
          onChange={(e) => handleMaxChange(+e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded w-24 text-center"
        />
      </div>
    </div>
  );
};

export default MultiRangeSlider;
