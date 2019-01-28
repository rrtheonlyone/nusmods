// @flow

import type { AcademicGroup, AcademicOrg } from '../types/api';
import type { ModuleInfoMapped, SemesterModule, SemesterModuleData } from '../types/mapper';
import type { ModuleCode, RawLesson, Semester } from '../types/modules';

import type { Task } from '../types/tasks';
import config from '../config';
import BaseTask from './BaseTask';
import GetSemesterExams from './GetSemesterExams';
import GetModuleTimetable from './GetModuleTimetable';
import GetSemesterModules from './GetSemesterModules';
import { getCache } from '../services/output';
import { cleanObject, fromTermCode } from '../utils/api';

type Input = {|
  +departments: AcademicOrg[],
  +faculties: AcademicGroup[],
|};

type Output = SemesterModuleData[];

export const semesterModuleCache = (semester: Semester) =>
  getCache<SemesterModuleData[]>(`semester-${semester}-module-data`);

/**
 * Map ModuleInfo from the API into something closer to our own representation
 */
const cleanKeys = ['Workload', 'Prerequisite', 'Corequisite', 'Preclusion'];
const mapModuleInfo = (moduleInfo: ModuleInfoMapped): SemesterModule => {
  const {
    Term,
    AcademicOrganisation,
    CourseTitle,
    WorkLoadHours,
    Preclusion,
    PreRequisite,
    CoRequisite,
    ModularCredit,
    Description,
    Subject,
    CatalogNumber,
  } = moduleInfo;

  const [AcadYear] = fromTermCode(Term);

  return cleanObject(
    {
      AcadYear,
      Preclusion,
      ModuleDescription: Description,
      Department: AcademicOrganisation,
      ModuleTitle: CourseTitle,
      Workload: WorkLoadHours,
      Prerequisite: PreRequisite,
      Corequisite: CoRequisite,
      ModuleCredit: ModularCredit,
      ModuleCode: Subject + CatalogNumber,
    },
    cleanKeys,
  );
};

/**
 * Download modules info for all faculties in a specific semester. This task
 * uses the subtasks
 *
 * - GetSemesterExams
 * - GetSemesterModules
 * - GetModuleTimetable
 *
 * Output:
 * - <semester>/<module code>/semesterData.json
 */
export default class GetSemesterData extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  logger = this.rootLogger.child({
    task: GetSemesterData.name,
    year: this.academicYear,
    semester: this.semester,
  });

  semesterModuleCache = semesterModuleCache(this.semester);

  get name() {
    return `Get data for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
  }

  async getExams() {
    // Retrieve all exams for this semester
    const getExams = new GetSemesterExams(this.semester, this.academicYear);
    return getExams.run();
  }

  async getModules(input: Input): Promise<ModuleInfoMapped[]> {
    // Retrieve all module info from this semester
    const getModules = new GetSemesterModules(this.semester, this.academicYear);
    return getModules.run(input);
  }

  async getTimetable(moduleCode: ModuleCode): Promise<?Array<RawLesson[]>> {
    const getTimetable = new GetModuleTimetable(moduleCode, this.semester, this.academicYear);

    try {
      return await getTimetable.run();
    } catch (e) {
      // If the API does not have a timetable record (even one with invalid lessons)
      // then the class isn't actually offered, so we return null and have it
      // filtered out after Promise.all
      return null;
    }
  }

  async run(input: Input) {
    this.logger.info(`Getting semester data for ${this.academicYear} semester ${this.semester}`);

    // Get exams and module info in parallel
    const [exams, modules] = await Promise.all([this.getExams(), this.getModules(input)]);

    // Fan out to get module timetable
    const timetableRequests = modules.map(async (moduleInfo) => {
      const moduleCode = moduleInfo.Subject + moduleInfo.CatalogNumber;

      const timetable = await this.getTimetable(moduleCode);
      if (!timetable) return null;

      // Combine timetable and exam data into SemesterData
      const examInfo = exams[moduleCode] || {};
      const SemesterData = {
        Semester: this.semester,
        Timetable: timetable,
        ...examInfo,
      };

      // Map module info to the shape expected by our frontend
      const Module = mapModuleInfo(moduleInfo);

      return {
        ModuleCode: moduleCode,
        Module,
        SemesterData,
      };
    });

    const semesterModuleData = (await Promise.all(timetableRequests)).filter(Boolean);

    // Log some statistics
    this.logger.debug('%i/%i modules have timetables', semesterModuleData.length, modules.length);

    // Save the merged semester data to disk
    await Promise.all(
      semesterModuleData.map((semesterData) =>
        this.output.semesterData(this.semester, semesterData.ModuleCode, semesterData.SemesterData),
      ),
    );

    // Cache semester data to disk
    await this.semesterModuleCache.write(semesterModuleData);

    return semesterModuleData;
  }
}
