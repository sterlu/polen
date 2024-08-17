import {MeasurementWithConcentrations} from "./types.ts";

export const dateStampFromDaysAgo = (days: number): string => {
  // (new Date(Date.now() - 1000 * 60 * 60 * 24 * fetchPrevDays)).toISOString().split('T')[0]
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
export const formatDateToWeekday = (date: MeasurementWithConcentrations['date']): string => {
  return new Date(date).toLocaleDateString('sr-RS', {weekday: 'short'});
}

export const formatDateToDate = (date: MeasurementWithConcentrations['date']): string => {
  return `${new Date(date).toLocaleDateString('sr-RS', {day: 'numeric', month: 'short'})}`;
}
