import _ from 'lodash';

import {
  Day,
  Lesson,
  Module,
  RawLesson,
  Semester,
  SemesterData,
  SemesterDataCondensed,
  Time,
} from 'types/modules';

import config from 'config';
import { NBSP } from 'utils/react';

// Look for strings that look like module codes - eg.
// ACC1010  - 3 chars, 4 digits, no suffix
// CS1010FC - 2 chars, 4 digits, 2 chars
// CS2014R  - 2 chars, 4 digits, 1 char
// BMA 5001 - 3 chars, space, 4 digits
export const MODULE_CODE_REGEX = /\b(\w{2,3}\s*\d{4}\w{0,3})\b/g;

// Returns semester specific details such as exam date and timetable.
export function getModuleSemesterData(
  module: Module,
  semester: Semester,
): SemesterData | undefined {
  return module.SemesterData.find((semData: SemesterData) => semData.Semester === semester);
}

// Returns a flat array of lessons of a module for the corresponding semester.
export function getModuleTimetable(module: Module, semester: Semester): RawLesson[] {
  return _.get(getModuleSemesterData(module, semester), 'Timetable', []);
}

// Do these two lessons belong to the same class?
export function areLessonsSameClass(lesson1: Lesson, lesson2: Lesson): boolean {
  return (
    lesson1.ModuleCode === lesson2.ModuleCode &&
    lesson1.ClassNo === lesson2.ClassNo &&
    lesson1.LessonType === lesson2.LessonType
  );
}

/**
 * Convert examDate to JS Date object. Unfortunately just doing
 * new Date(examDate) won't work on Safari, since the timestamp is almost but not
 * quite ISO8601 standard
 *
 * The API returns examDate with hhmm as the TZ specifier, but we want
 * this to work on machines in all timezones, so instead we lop it off and
 * pretend it is in UTC time
 */
export function examDateToDate(examDate: string): Date {
  return new Date(`${examDate.slice(0, 16)}Z`);
}

/**
 * Convert exam in ISO format to 12-hour date/time format. We slice off the
 * SGT time zone and interpret as UTC time, then use the getUTC* methods so
 * that they will correspond to Singapore time regardless of the local time
 * zone.
 */
export function formatExamDate(examDate: string | null | undefined): string {
  if (!examDate) return 'No Exam';

  const date = examDateToDate(examDate);
  const hours: number = date.getUTCHours();

  const day: string = _.padStart(`${date.getUTCDate().toString()}`, 2, '0');
  const month: string = _.padStart(`${date.getUTCMonth() + 1}`, 2, '0');
  const year: number = date.getUTCFullYear();
  const hour: number = hours % 12 || 12;
  const minute: string = _.padStart(`${date.getUTCMinutes()}`, 2, '0');
  const amPm: string = hours < 12 ? 'AM' : 'PM';
  return `${day}-${month}-${year} ${hour}:${minute} ${amPm}`;
}

export function getModuleExamDate(module: Module, semester: Semester): string {
  return _.get(getModuleSemesterData(module, semester), 'ExamDate')!;
}

export function getFormattedModuleExamDate(module: Module, semester: Semester): string {
  const examDate = getModuleExamDate(module, semester);
  return formatExamDate(examDate);
}

// Returns the current semester if it is found in semesters, or the first semester
// where it is available
export function getFirstAvailableSemester(
  semesters: SemesterDataCondensed[],
  current: Semester = config.semester, // For testing only
): Semester {
  const availableSemesters = semesters.map((semesterData) => semesterData.Semester);
  return availableSemesters.includes(current) ? current : _.min(availableSemesters)!;
}

export function getSemestersOffered(module: Module): Semester[] {
  return module.SemesterData.map((semesterData) => semesterData.Semester).sort();
}

export function getTimeslot(day: Day, time: Time): string {
  return `${day} ${time}`;
}

export function renderMCs(moduleCredits: number | string) {
  const credit = typeof moduleCredits === 'string' ? parseInt(moduleCredits, 10) : moduleCredits;
  return `${credit}${NBSP}${credit === 1 ? 'MC' : 'MCs'}`;
}

export function subtractAcadYear(acadYear: string): string {
  return acadYear.replace(/\d+/g, (year) => String(parseInt(year, 10) - 1));
}

export function addAcadYear(acadYear: string): string {
  return acadYear.replace(/\d+/g, (year) => String(parseInt(year, 10) + 1));
}

export function offsetAcadYear(year: string, offset: number) {
  let i = offset;
  let currentYear = year;

  while (i !== 0) {
    if (offset < 0) {
      currentYear = subtractAcadYear(currentYear);
      i += 1;
    } else {
      currentYear = addAcadYear(currentYear);
      i -= 1;
    }
  }

  return currentYear;
}

export function getYearsBetween(minYear: string, maxYear: string): string[] {
  if (minYear > maxYear) throw new Error('minYear should be less than or equal to maxYear');

  const years = [];
  let nextYear = minYear;
  while (nextYear !== maxYear) {
    years.push(nextYear);
    nextYear = addAcadYear(nextYear);
  }
  years.push(maxYear);
  return years;
}