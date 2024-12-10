import { useCallback, useEffect, useState, useRef } from 'react';

const MultiRangeSlider: React.FC<{
  className?: string;
  min: number;
  max: number;
  step?: number;
  initialMin: number;
  initialMax: number;
  onChange: (value: { min: number; max: number }) => void;
}> = ({ className, min, max, step = 1, initialMin, initialMax, onChange }) => {
  const [minVal, setMinVal] = useState(initialMin);
  const [maxVal, setMaxVal] = useState(initialMax);

  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onChange({ min: minVal, max: maxVal });
    }, 100);

    return () => clearTimeout(timeout);
  }, [minVal, maxVal, onChange]);

  const handleMinChange = (value: number) => {
    if (value !== minVal) setMinVal(Math.min(value, maxVal - step));
  };

  const handleMaxChange = (value: number) => {
    if (value !== maxVal) setMaxVal(Math.max(value, minVal + step));
  };

  const handleDrag = (e: React.MouseEvent, isMin: boolean) => {
    e.preventDefault();
    const moveHandler = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement)
        .closest('.relative')
        ?.getBoundingClientRect();
      if (!rect) return;

      const offsetX = (e.clientX - rect.left) / rect.width;
      const newValue = min + offsetX * (max - min);

      if (isMin) {
        handleMinChange(Math.min(Math.max(min, newValue), maxVal - step));
      } else {
        handleMaxChange(Math.max(Math.min(max, newValue), minVal + step));
      }
    };

    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  };

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
          className="absolute z-50 w-4 h-4 top-0 bg-green-300 rounded-full -mt-1 -ml-1 cursor-pointer"
          onMouseDown={(e) => handleDrag(e, true)}
        ></div>

        <div
          style={{ left: `${getPercent(maxVal)}%` }}
          className="absolute z-30 w-4 h-4 top-0 bg-green-300 rounded-full -mt-1 -ml-3 cursor-pointer"
          onMouseDown={(e) => handleDrag(e, false)}
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
