import { validatePassword } from "./auth/validatePassword";
import { validateUser } from "./auth/validateUser";
import { fetchAttendance } from "./fetch/fetchAttendance";
import { fetchCourseDetails } from "./fetch/fetchCourseDetails";
import { fetchMarks } from "./fetch/fetchMarks";
import { fetchUserInfo } from "./fetch/fetchUserInfo";
import { fetchLogout } from "./fetch/fetchLogout";
import { parseAttendance } from "./parser/parseAttendance";
import { parseCalendar } from "./parser/parseCalender";
import { parseCourseDetails } from "./parser/parseCourse";
import { parseMarks } from "./parser/parseMarks";
import { parseTimetable } from "./parser/parseTimetable";
import { parseUserInfo } from "./parser/parseUserInfo";

// Import all types
import {
  // Auth types
  PasswordInput,
  UserResponse,
  AuthResult,
  UserValidationResult,
  LogoutResponse,
  // Response types
  TimetableResponse,
  AttendanceResponse,
  MarksResponse,
  CalendarResponse,
  CourseResponse,
  UserInfoResponse,
  // Data types
  MarkDetail,
  Mark,
  Month,
  Day,
  CourseDetail,
  AttendanceDetail,
  UserInfo,
  DaySchedule,
  CourseSlot,
  SlotInfo,
} from "./type";
import { fetchTimetable } from "./fetch/fetchTimetable";
import { fetchCalendar } from "./fetch/fetchCalender";

// Re-export all types
export type {
  // Auth types
  PasswordInput,
  UserResponse,
  AuthResult,
  UserValidationResult,
  LogoutResponse,
  // Response types
  TimetableResponse,
  AttendanceResponse,
  MarksResponse,
  CalendarResponse,
  CourseResponse,
  UserInfoResponse,
  // Data types
  MarkDetail,
  Mark,
  Month,
  Day,
  CourseDetail,
  AttendanceDetail,
  UserInfo,
  DaySchedule,
  CourseSlot,
  SlotInfo,
};

// Verify-user
export async function verifyUser(
  username: string
): Promise<UserValidationResult> {
  return await validateUser(username);
}

// Verify-password
export async function verifyPassword({
  identifier,
  digest,
  password,
}: PasswordInput): Promise<AuthResult> {
  return await validatePassword({ identifier, digest, password });
}

// Logout
export async function logoutUser(cookie: string): Promise<LogoutResponse> {
  return await fetchLogout(cookie);
}

// Get TimeTable
export async function getTimetable(cookie: string): Promise<TimetableResponse> {
  const fetch = await fetchTimetable(cookie);
  if (fetch.error) return { error: fetch.error, status: fetch.status };
  const parse = await parseTimetable(fetch);
  if (parse.error) return { error: parse.error, status: parse.status };
  return parse;
}

// Get Attendance
export async function getAttendance(
  cookie: string
): Promise<AttendanceResponse> {
  const fetch = await fetchAttendance(cookie);
  if (fetch.error) return { error: fetch.error, status: fetch.status };
  const parse = await parseAttendance(fetch);
  if (parse.error) return { error: parse.error, status: parse.status };
  return parse;
}

// Get Marks
export async function getMarks(cookie: string): Promise<MarksResponse> {
  const fetch = await fetchMarks(cookie);
  if (fetch.error) return { error: fetch.error, status: fetch.status };
  const parse = await parseMarks(fetch);
  if (parse.error) return { error: parse.error, status: parse.status };
  return parse;
}

// Get UserInfo
export async function getUserInfo(cookie: string): Promise<UserInfoResponse> {
  const fetch = await fetchUserInfo(cookie);
  if (fetch.error) return { error: fetch.error, status: fetch.status };
  const parse = await parseUserInfo(fetch);
  if (parse.error) return { error: parse.error, status: parse.status };
  return parse;
}

// Get Calendar
export async function getCalendar(cookie: string): Promise<CalendarResponse> {
  const fetch = await fetchCalendar(cookie);
  if (fetch.error) return { error: fetch.error, status: fetch.status };
  const parse = await parseCalendar(fetch);
  if (parse.error) return { error: parse.error, status: parse.status };
  return parse;
}

// Get Course
export async function getCourse(cookie: string): Promise<CourseResponse> {
  const fetch = await fetchCourseDetails(cookie);
  if (fetch.error) return { error: fetch.error, status: fetch.status };
  const parse = await parseCourseDetails(fetch);
  if (parse.error) return { error: parse.error, status: parse.status };
  return parse;
}
