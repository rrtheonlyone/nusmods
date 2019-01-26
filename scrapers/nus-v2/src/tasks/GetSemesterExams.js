// @flow

import { mapValues, keyBy } from 'lodash';
import type { ModuleExam } from '../types/api';
import type { ExamInfoMap } from '../types/mapper';
import type { Semester } from '../types/modules';
import config from '../config';
import { cacheDownload, getTermCode } from '../utils/api';
import BaseTask from './BaseTask';
import type { Task } from '../types/tasks';
import { mapExamInfo } from '../components/mapper';
import { TaskError } from '../components/errors';

type Output = ExamInfoMap;

/**
 * Download modules info for all faculties in a specific semester
 */
export default class GetSemesterExams extends BaseTask implements Task<void, Output> {
  semester: Semester;
  academicYear: string;

  logger = this.rootLogger.child({
    task: GetSemesterExams.name,
    year: this.academicYear,
    semester: this.semester,
  });

  get name() {
    return `Get exams for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
  }

  async run() {
    this.logger.info(
      `Getting exams for all modules in ${this.academicYear} semester ${this.semester}`,
    );
    const term = getTermCode(this.semester, this.academicYear);

    // Make API requests to get the exam info
    let rawExams: ModuleExam[];
    try {
      rawExams = await cacheDownload(
        'exams',
        () => this.api.getTermExams(term),
        this.fs.raw.semester(this.semester).exams,
        this.logger,
      );
    } catch (e) {
      throw new TaskError('Cannot get exam data', this, e);
    }

    const exams = mapValues(keyBy(rawExams, (exam) => exam.module), mapExamInfo);
    this.logger.info(`Downloaded ${rawExams.length} exams`);

    return exams;
  }
}
