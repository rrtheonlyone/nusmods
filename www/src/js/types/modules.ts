// Components within a module:
import { ColorIndex } from './reducers';

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
export type Workload = string | ReadonlyArray<number>;
export type Venue = string;

export type WeekRange = {
  // The start and end dates
  start: string;
  end: string;
  // Number of weeks between each lesson. If not specified one week is assumed
  // ie. there are lessons every week
  weekInterval?: number;
  // Week intervals for modules with uneven spacing between lessons
  weeks?: number[];
};

export type Weeks = ReadonlyArray<number> | WeekRange;

/**
 * Typesafe helper functions for consuming Weeks
 */
export const isWeekRange = (week: Weeks): week is WeekRange => !Array.isArray(week);

export const consumeWeeks = <T = void>(
  weeks: Weeks,
  consumeNumericWeeks: (weeks: number[]) => T,
  consumeWeekRange: (weekRange: WeekRange) => T,
): T => {
  if (Array.isArray(weeks)) return consumeNumericWeeks(weeks);
  return consumeWeekRange(weeks as WeekRange);
};

// Recursive tree of module codes and boolean operators for the prereq tree
export type PrereqTree = string | { and?: PrereqTree[]; or?: PrereqTree[] };

// Auxiliary data types
export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const WorkingDays: ReadonlyArray<Day> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DaysOfWeek: ReadonlyArray<Day> = [...WorkingDays, 'Sunday'];

export type ModuleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 8;
export const Semesters: ReadonlyArray<Semester> = [1, 2, 3, 4];

export type WorkloadComponent = 'Lecture' | 'Tutorial' | 'Laboratory' | 'Project' | 'Preparation';

// Workload components as defined by CORS, in their correct positions (see below).
export const WORKLOAD_COMPONENTS: WorkloadComponent[] = [
  'Lecture',
  'Tutorial',
  'Laboratory',
  'Project',
  'Preparation',
];

// RawLesson is a lesson time slot obtained from the API.
// Usually ModuleCode and ModuleTitle has to be injected in before using in the timetable.
export type RawLesson = Readonly<{
  ClassNo: ClassNo;
  DayText: DayText;
  EndTime: EndTime;
  LessonType: LessonType;
  StartTime: StartTime;
  Venue: Venue;
  Weeks: Weeks;
}>;

// Semester-specific information of a module.
export type SemesterData = {
  Semester: Semester;
  Timetable: ReadonlyArray<RawLesson>;

  // Exam
  ExamDate?: string;
  ExamDuration?: number;
};

// Information for a module for a particular academic year.
export type Module = {
  AcadYear: AcadYear;

  // Basic info
  ModuleCode: ModuleCode;
  ModuleTitle: ModuleTitle;

  // Additional info
  ModuleDescription?: string;
  ModuleCredit: string;
  Department: Department;
  Faculty: Faculty;
  Workload?: Workload;
  Aliases?: ModuleCode[];

  // Requsites
  Prerequisite?: string;
  Corequisite?: string;
  Preclusion?: string;

  // Semester data
  SemesterData: ReadonlyArray<SemesterData>;

  // Requisites
  PrereqTree?: PrereqTree;
  FulfillRequirements?: ReadonlyArray<ModuleCode>;
};

export type ModuleWithColor = Module & {
  colorIndex: ColorIndex;
  hiddenInTimetable: boolean;
};

// This format is returned from the module list endpoint.
export type ModuleCondensed = Readonly<{
  ModuleCode: ModuleCode;
  ModuleTitle: ModuleTitle;
  Semesters: ReadonlyArray<number>;
}>;

// This format is returned from the module information endpoint
export type SemesterDataCondensed = Readonly<{
  Semester: Semester;
  ExamDate?: string;
  ExamDuration?: number;
  // The full timetable is not provided to reduce space
}>;

// Subset of Module object that contains the properties that are
// needed for module search
export type SearchableModule = {
  ModuleCode: ModuleCode;
  ModuleTitle: ModuleTitle;
  ModuleDescription?: string;
};

export type ModuleInformation = Readonly<{
  // Basic info
  ModuleCode: ModuleCode;
  ModuleTitle: ModuleTitle;

  // Additional info
  ModuleDescription?: string;
  ModuleCredit: string;
  Department: Department;
  Faculty: Faculty;
  Workload?: Workload;

  // Requsites
  Prerequisite?: string;
  Corequisite?: string;
  Preclusion?: string;

  // Condensed semester info
  SemesterData: ReadonlyArray<SemesterDataCondensed>;

  // Requisite tree is not returned to save space
}>;

// RawLessons obtained from API does not include ModuleCode and ModuleTitle by default.
// They have to be injected in before using in the timetable.
export type Lesson = RawLesson & {
  ModuleCode: ModuleCode;
  ModuleTitle: ModuleTitle;
};

export type ColoredLesson = Lesson & {
  colorIndex: number;
};

type Modifiable = {
  isModifiable?: boolean;
  isAvailable?: boolean;
  isActive?: boolean;
  colorIndex: number;
};

// Lessons do not implement a modifiable interface.
export type ModifiableLesson = ColoredLesson & Modifiable;
