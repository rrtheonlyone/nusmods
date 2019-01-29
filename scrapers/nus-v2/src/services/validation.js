// @flow

/**
 * Simple validation function to ensure the API is not sending us garbage
 */

import Joi from 'joi';
import type { ModuleExam, TimetableLesson } from '../types/api';
import type { Semester } from '../types/modules';

import { activityLessonType, dayTextMap } from './data';
import { Semesters } from '../types/modules';

const lessonSchema = Joi.object({
  // Allow null because we can still use the rest of the information
  room: Joi.string().allow(null),
  start_time: Joi.string(),
  eventdate: Joi.string().isoDate(),

  activity: Joi.string().only(Object.keys(activityLessonType)),

  modgrp: Joi.string(),

  // Assume lessons on Sunday are invalid
  day: Joi.string().only(Object.keys(dayTextMap)),

  numweeks: Joi.number()
    .integer()
    .greater(0),
});

export function validateLesson(lesson: TimetableLesson) {
  const result = Joi.validate(lesson, lessonSchema, { presence: 'required', allowUnknown: true });
  return !result.error;
}

const examSchema = Joi.object({
  start_time: Joi.string(),
  module: Joi.string(),
  duration: Joi.number()
    .integer()
    .greater(0),
  exam_date: Joi.string().isoDate(),
});

export function validateExam(exam: ModuleExam) {
  const result = Joi.validate(exam, examSchema, { presence: 'required', allowUnknown: true });
  return !result.error;
}

const semesterSchema = Joi.number().only(Semesters);
export function validateSemester(semester: string | Semester) {
  const result = Joi.validate(+semester, semesterSchema, { presence: 'required' });
  return !result.error;
}