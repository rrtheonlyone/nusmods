// @flow

// Components within a module:
export type AcadYear = string; // E.g. "2016/2017"
export type ClassNo = string; // E.g. "1", "A"
export type DayText = string; // E.g. "Monday", "Tuesday"
export type Department = string;
export type StartTime = string; // E.g. "1400"
export type EndTime = string; // E.g. "1500"
export type Faculty = string;
export type LessonType = string; // E.g. "Lecture", "Tutorial"
export type LessonTime = StartTime | EndTime;
export type ModuleCode = string; // E.g. "CS3216"
export type ModuleTitle = string;
export type Semester = number; // E.g. 1/2/3/4. 3 and 4 means special sem i and ii.
export type WeekText = string; // E.g. "Every Week", "Odd Week"
export type Venue = string;

// Auxiliary data types
export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const WorkingDaysOfWeek: Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DaysOfWeek: Day[] = [...WorkingDaysOfWeek, 'Sunday'];

export type Time = 'Morning' | 'Afternoon' | 'Evening';
export const TimesOfDay: Time[] = ['Morning', 'Afternoon', 'Evening'];

export type ModuleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 8;
export const Semesters = [1, 2, 3, 4];

export type WorkloadComponent = 'Lecture' | 'Tutorial' | 'Laboratory' | 'Project' | 'Preparation';

// RawLesson is a lesson time slot obtained from the API.
// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type RawLesson = {
  ClassNo: ClassNo,
  DayText: DayText,
  EndTime: EndTime,
  LessonType: LessonType,
  StartTime: StartTime,
  Venue: Venue,
  WeekText: WeekText,
};

// Semester-specific information of a module.
export type SemesterData = {|
  +Semester: Semester,
  +Timetable: Array<RawLesson>,

  // Exam
  +ExamDate?: string,
  +ExamDuration?: number,

  // Deprecated
  +LecturePeriods?: Array<string>,
  +TutorialPeriods?: Array<string>,
|};

// Recursive definition for walking a module tree
export type TreeFragment = {|
  +name: string,
  // TreeFragment[] will result in infinite loop
  +children: Array<TreeFragment>,
|};

// Information for a module for a particular academic year.
// This is probably the only model you need to be concerned with.
// For some reason es6 object literal property value shorthand is not recognized >_<
export type Module = {
  AcadYear: AcadYear,

  // Basic info
  ModuleCode: ModuleCode,
  ModuleTitle: ModuleTitle,

  // Additional info
  ModuleDescription?: string,
  ModuleCredit: string,
  Department: Department,
  Workload?: string,

  // Requsites
  Prerequisite?: string,
  Corequisite?: string,
  Preclusion?: string,

  // Semester data
  History: Array<SemesterData>,

  // Requisites
  ModmavenTree: TreeFragment,
  LockedModules?: Array<ModuleCode>,

  // Deprecated
  Types?: Array<string>,
};

// This format is returned from the module list endpoint.
export type ModuleCondensed = {|
  +ModuleCode: ModuleCode,
  +ModuleTitle: ModuleTitle,
  +Semesters: number[],
|};

// This format is returned from the module information endpoint
export type SemesterDataCondensed = {|
  +Semester: Semester,
  +ExamDate?: string,
  +ExamDuration?: number,
  // The full timetable is not provided to reduce space
|};

export type ModuleInformation = {|
  // Basic info
  +ModuleCode: ModuleCode,
  +ModuleTitle: ModuleTitle,

  // Additional info
  +ModuleDescription?: string,
  +ModuleCredit: string,
  +Department: Department,
  +Workload?: string,

  // Requsites
  +Prerequisite?: string,
  +Corequisite?: string,
  +Preclusion?: string,

  // Condensed semester info
  +History: Array<SemesterDataCondensed>,

  // Requisite tree is not returned to save space
|};