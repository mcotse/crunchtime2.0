import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { MONTH_NAMES, DAY_LABELS, getDaysInMonth, getFirstDayOfWeek } from './eventFormHelpers';
interface CalendarPickerProps {
  value: string;
  onChange: (val: string) => void;
}
export function CalendarPicker({
  value,
  onChange
}: CalendarPickerProps) {
  const today = new Date();
  const initYear = value ? parseInt(value.split('-')[0]) : today.getFullYear();
  const initMonth = value ? parseInt(value.split('-')[1]) - 1 : today.getMonth();
  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);
  const daysInPrev = getDaysInMonth(viewYear, viewMonth - 1 < 0 ? 11 : viewMonth - 1);
  const selectedDay = value ? parseInt(value.split('-')[2]) : null;
  const selectedMonth = value ? parseInt(value.split('-')[1]) - 1 : null;
  const selectedYear = value ? parseInt(value.split('-')[0]) : null;
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };
  const cells: {
    day: number;
    month: 'prev' | 'curr' | 'next';
  }[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({
    day: daysInPrev - firstDow + 1 + i,
    month: 'prev'
  });
  for (let d = 1; d <= daysInMonth; d++) cells.push({
    day: d,
    month: 'curr'
  });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({
    day: d,
    month: 'next'
  });
  const isToday = (d: number, m: 'prev' | 'curr' | 'next') => m === 'curr' && d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (d: number, m: 'prev' | 'curr' | 'next') => m === 'curr' && d === selectedDay && viewMonth === selectedMonth && viewYear === selectedYear;
  const handleDayClick = (d: number, m: 'prev' | 'curr' | 'next') => {
    let y = viewYear,
      mo = viewMonth;
    if (m === 'prev') {
      mo--;
      if (mo < 0) {
        mo = 11;
        y--;
      }
    }
    if (m === 'next') {
      mo++;
      if (mo > 11) {
        mo = 0;
        y++;
      }
    }
    const mm = String(mo + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    onChange(`${y}-${mm}-${dd}`);
    if (m !== 'curr') {
      setViewMonth(mo);
      setViewYear(y);
    }
  };
  return <div className="rounded-[20px] overflow-hidden" style={{
    backgroundColor: 'var(--eqx-surface)',
    border: '1px solid var(--eqx-hairline)'
  }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-[0.7]" style={{
        color: 'var(--eqx-tertiary)'
      }}>
          <ChevronLeftIcon size={16} strokeWidth={1.5} />
        </button>
        <span className="text-[15px] font-semibold" style={{
        color: 'var(--eqx-primary)'
      }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-[0.7]" style={{
        color: 'var(--eqx-tertiary)'
      }}>
          <ChevronRightIcon size={16} strokeWidth={1.5} />
        </button>
      </div>
      <div className="grid grid-cols-7 px-3 pb-1">
        {DAY_LABELS.map((l, i) => <div key={i} className="flex items-center justify-center h-7">
            <span className="text-[11px] font-medium uppercase" style={{
          color: 'var(--eqx-tertiary)'
        }}>
              {l}
            </span>
          </div>)}
      </div>
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
        {cells.map((cell, idx) => {
        const sel = isSelected(cell.day, cell.month);
        const tod = isToday(cell.day, cell.month);
        const other = cell.month !== 'curr';
        return <div key={idx} className="flex items-center justify-center">
              <button type="button" onClick={() => handleDayClick(cell.day, cell.month)} className="w-9 h-9 flex items-center justify-center rounded-full text-[14px] font-medium active:opacity-[0.7]" style={{
            backgroundColor: sel ? 'var(--eqx-primary)' : 'transparent',
            color: sel ? 'var(--eqx-base)' : other ? 'var(--eqx-tertiary)' : 'var(--eqx-primary)',
            opacity: other ? 0.3 : 1,
            border: tod && !sel ? '1px solid var(--eqx-hairline)' : 'none'
          }}>
                {cell.day}
              </button>
            </div>;
      })}
      </div>
    </div>;
}