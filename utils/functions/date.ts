import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import dayjs, { Dayjs } from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isTodayPlugin from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import weekday from 'dayjs/plugin/weekday';

import isoWeek from 'dayjs/plugin/isoWeek';

import 'dayjs/locale/rw';

dayjs.extend(isoWeek);

dayjs.extend(isTodayPlugin);
dayjs.extend(isTomorrow);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export const TIME_FORMAT = 'h:mm A';
export const DATE_FORMAT = 'ddd, Do MMMM YY';
export const FILTERS_DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_FORMAT_WITH_YEAR = 'ddd, Do MMM YYYY';
export const DATE_FORMAT_WITH_TIME = 'ddd, Do MMM - h:mm A';

export const msToTime = (ms: number) => {
  let seconds = Math.floor((ms / 1000) % 60);
  let minutes = Math.floor((ms / (1000 * 60)) % 60);
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 3600 * 24));

  hours = hours < 10 ? hours : hours;
  minutes = minutes < 10 ? minutes : minutes;
  seconds = seconds < 10 ? seconds : seconds;

  return { hours, minutes, seconds, days };
};

export const formatToTime = (date: string | Date | Dayjs) => dayjs(date).format(TIME_FORMAT);

export const formatToDate = (date: number | string | Date | Dayjs, format: string = DATE_FORMAT) => {
  return dayjs(date).format(format);
};

/** Format a date using the given locale (Kinyarwanda: `'rw'`). */
export const formatToDateWithLocale = (
  date: number | string | Date | Dayjs,
  format: string = DATE_FORMAT,
  locale: string = 'rw'
) => {
  return dayjs(date).locale(locale).format(format);
};

export const dateFormatterNth = (date: string | Date) => {
  const isToday = dayjs(date).isToday();
  const isTomorrow = dayjs(date).isTomorrow();
  const formatted = formatToDate(date);
  return isToday
    ? `Today, ${formatToTime(date)}`
    : isTomorrow
      ? `Tomorrow, ${formatToTime(date)}`
      : formatted;
};

export const timeOfDay = () => {
  // Get the current time
  const currentTime = dayjs();

  // Define morning and afternoon boundaries
  const morningBoundary = dayjs().hour(12).minute(0).second(0); // Assuming morning ends at 12 PM
  const afternoonBoundary = dayjs().hour(18).minute(0).second(0); // Assuming afternoon ends at 6 PM

  // Check if it's morning or afternoon
  let timeOfDay;
  if (currentTime.isBefore(morningBoundary)) {
    timeOfDay = 'morning';
  } else if (currentTime.isBefore(afternoonBoundary)) {
    timeOfDay = 'afternoon';
  } else {
    timeOfDay = 'evening'; // You can adjust this based on your needs
  }
  return timeOfDay;
};

export const formatDate = (dateToConvert: Date | string) => {
  const now = new Date();
  const date = new Date(dateToConvert);

  const diff = now.getTime() - date.getTime();
  const { seconds, minutes, hours, days } = msToTime(diff);

  if (days > 7) {
    return dateFormatterNth(dateToConvert);
  } else if (days) {
    return `${days}${days <= 1 ? 'd' : 'ds'}`;
  } else if (hours) {
    return `${hours}${hours <= 1 ? 'hr' : 'hrs'}`;
  } else if (minutes) {
    return `${minutes}${minutes <= 1 ? 'm' : 'm'}`;
  } else if (seconds) {
    return `${seconds}${seconds <= 1 ? 's' : 's'}`;
  }
};

export const formatStartDateAndTime = (startDate: string, endDate: string) => {
  const startTime = dayjs(startDate).format(TIME_FORMAT);
  const endTime = dayjs(endDate).format(TIME_FORMAT);
  const formattedStartDate = dayjs(startDate).format('ddd, MMM');
  return `${formattedStartDate} . ${startTime} - ${endTime}`;
};

export const formatDateAndTime = (date: Date) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeekAbbreviated = daysOfWeek[date.getDay()];
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${dayOfWeekAbbreviated}, ${month} ${day} at ${time}`;
};

export function combineDateAndTime(dateObj: Dayjs, timeObj: Dayjs) {
  return dateObj.hour(timeObj.hour()).minute(timeObj.minute()).second(timeObj.second());
}

export const getStartOfDay = (value: Dayjs) => value.startOf('day').unix();
export const getEndOfDay = (value: Dayjs) => value.endOf('day').add(12, 'hours').unix();

export const getStartOfWeek = (value: Dayjs) => value.startOf('isoWeek').unix();

export const getEndOfWeek = (value: Dayjs) => value.endOf('isoWeek').unix();

export const formatStartingDateValueToUnix = (value: any) => getStartOfDay(dayjs(value.toDate('UTC')));

export const formatEndingDateValueToUnix = (value: any) => getEndOfDay(dayjs(value.toDate('UTC')));


export const defaultStartDate = dayjs().add(30, 'minutes');
export const defaultEndDate = dayjs().add(12, 'hours');

export const transformDateToUnixFormat = (date?: Dayjs | number | string): number => {
  if (!date) return dayjs().unix();
  if (typeof date === 'number') return date;
  if (typeof date === 'string') return dayjs(date).unix();
  return date.unix();
};

export const isDateOneAfterDateTwo = ({ dateOne, dateTwo }: { dateOne: Dayjs; dateTwo: Dayjs }) => {
  return dayjs(dateOne).isAfter(dayjs(dateTwo));
};
