// Attendance Types
export interface AttendanceDetail {
  courseCode: string;
  courseTitle: string;
  courseCategory: string;
  courseFaculty: string;
  courseSlot: string;
  courseConducted: number;
  courseAbsent: number;
  courseAttendance: string;
  courseAttendanceStatus: AttendanceStatusType;
}

export interface AttendanceResponse {
  attendance?: AttendanceDetail[];
  error?: string;
  status: number;
}

export interface AttendanceStatusType {
  status: "required" | "margin";
  classes: number;
}
