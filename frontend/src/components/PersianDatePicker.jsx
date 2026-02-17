import { Calendar } from 'lucide-react';
import DateObject from 'date-object';
import DatePicker from 'react-multi-date-picker';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import persian_fa from 'react-date-object/locales/persian_fa';

function toIsoLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function resolveMinDateIso(minDate) {
  if (minDate instanceof Date) return toIsoLocal(minDate);
  if (typeof minDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(minDate)) return minDate;
  return toIsoLocal(new Date());
}

function toPersianDateObject(isoDate) {
  if (!isoDate) return null;
  return new DateObject({
    date: isoDate,
    format: 'YYYY-MM-DD',
    calendar: gregorian,
    locale: gregorian_en,
  }).convert(persian, persian_fa);
}

function toGregorianIso(dateValue) {
  if (!dateValue) return '';
  const source = Array.isArray(dateValue) ? dateValue[0] : dateValue;
  return new DateObject(source).convert(gregorian, gregorian_en).format('YYYY-MM-DD');
}

export default function PersianDatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  minDate,
  className = '',
}) {
  const minDateIso = resolveMinDateIso(minDate);
  const selectedValue = toPersianDateObject(value);
  const minDateValue = toPersianDateObject(minDateIso);

  return (
    <DatePicker
      value={selectedValue}
      onChange={(dateValue) => {
        const nextValue = toGregorianIso(dateValue);
        if (!nextValue || nextValue < minDateIso) return;
        onChange?.(nextValue);
      }}
      calendar={persian}
      locale={persian_fa}
      format="YYYY/MM/DD"
      editable={false}
      minDate={minDateValue}
      disabled={disabled}
      calendarPosition="bottom-right"
      className="persian-date-picker"
      containerClassName={`w-full ${className}`.trim()}
      render={(displayValue, openCalendar) => (
        <button
          type="button"
          onClick={openCalendar}
          disabled={disabled}
          className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all disabled:opacity-60"
        >
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className={displayValue ? 'text-slate-700' : 'text-slate-300'}>
            {displayValue || placeholder}
          </span>
        </button>
      )}
    />
  );
}
