'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ScrubberInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  description: string;
}

export function ScrubberInput({
  value,
  onChange,
  min,
  max,
  step,
  label,
  description,
}: ScrubberInputProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [localValue, setLocalValue] = useState(String(value));
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const clamp = useCallback(
    (v: number) => {
      const clamped = Math.min(max, Math.max(min, v));
      const rounded = Math.round(clamped / step) * step;
      const decimals = step < 1 ? String(step).split('.')[1]?.length ?? 0 : 0;
      return Number(rounded.toFixed(decimals));
    },
    [min, max, step]
  );

  // 슬라이더 바에서 값 계산
  const getValueFromPosition = useCallback(
    (clientX: number) => {
      const slider = sliderRef.current;
      if (!slider) return value;
      const rect = slider.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return clamp(min + percent * (max - min));
    },
    [min, max, clamp, value]
  );

  // 슬라이더 마우스 이벤트
  const handleSliderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingSlider.current = true;
      const newVal = getValueFromPosition(e.clientX);
      onChange(newVal);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    },
    [getValueFromPosition, onChange]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSlider.current) return;
      const newVal = getValueFromPosition(e.clientX);
      onChange(newVal);
    };

    const handleMouseUp = () => {
      if (!isDraggingSlider.current) return;
      isDraggingSlider.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [getValueFromPosition, onChange]);

  // 숫자 입력
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed);
      onChange(clamped);
      setLocalValue(String(clamped));
    } else {
      setLocalValue(String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleInputBlur();
    if (e.key === 'ArrowUp') { e.preventDefault(); onChange(clamp(value + step)); }
    if (e.key === 'ArrowDown') { e.preventDefault(); onChange(clamp(value - step)); }
  };

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      {/* 라벨 + 값 */}
      <div className="flex items-center justify-between">
        <div
          className="relative flex items-center gap-1"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="text-xs font-medium text-muted-foreground select-none">
            {label}
          </span>
          <svg className="h-3 w-3 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>

          {showTooltip && (
            <div className="absolute left-0 bottom-full mb-2 z-50 w-56 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
              {description}
              <div className="mt-1 text-muted-foreground">
                범위: {min} ~ {max} (단위: {step})
              </div>
            </div>
          )}
        </div>

        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-16 rounded border border-input bg-background px-1.5 py-0.5 text-xs text-right font-mono focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* 슬라이더 바 */}
      <div
        ref={sliderRef}
        className="relative h-5 flex items-center cursor-pointer group"
        onMouseDown={handleSliderMouseDown}
      >
        {/* 트랙 배경 */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-secondary" />

        {/* 채워진 트랙 */}
        <div
          className="absolute left-0 h-1.5 rounded-full bg-primary transition-[width] duration-75"
          style={{ width: `${percent}%` }}
        />

        {/* 핸들 (thumb) */}
        <div
          className="absolute h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm transition-transform group-hover:scale-110"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>
    </div>
  );
}
