import { differenceInDays, differenceInWeeks, differenceInMonths, isToday } from 'date-fns';

/**
 * Format a date string to show relative time (e.g., "Today", "2 days ago", "3 weeks ago")
 * @param dateString - ISO date string or any valid date string
 * @param localizeFunc - Localization function to translate the relative time strings
 * @returns Localized relative time string
 */
export function formatRelativeDate(
  dateString: string,
  localizeFunc: (key: string, params?: Record<number, number>) => string,
): string {
  const date = new Date(dateString);
  const now = new Date();

  // Check if it's today
  if (isToday(date)) {
    return localizeFunc('com_ui_today');
  }

  // Calculate differences
  const days = differenceInDays(now, date);

  // Less than a week (1-6 days ago)
  if (days < 7) {
    return days === 1
      ? localizeFunc('com_ui_day_ago')
      : localizeFunc('com_ui_days_ago', { 0: days });
  }

  // Less than a month (1-3 weeks ago)
  if (days < 30) {
    const weeks = differenceInWeeks(now, date);
    return weeks === 1
      ? localizeFunc('com_ui_week_ago')
      : localizeFunc('com_ui_weeks_ago', { 0: weeks });
  }

  // A month or more ago
  const months = differenceInMonths(now, date);
  return months === 1
    ? localizeFunc('com_ui_month_ago')
    : localizeFunc('com_ui_months_ago', { 0: months });
}
