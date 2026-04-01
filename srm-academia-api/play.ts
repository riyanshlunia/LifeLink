import {
  verifyUser,
  verifyPassword,
  getTimetable,
  getAttendance,
  getMarks,
  getCourse,
  getCalendar,
  getUserInfo,
} from "./src/index.js";

const USERNAME = process.env.ACADEMIA_USERNAME ?? "";
const PASSWORD = process.env.ACADEMIA_PASSWORD ?? "";

if (!USERNAME || !PASSWORD) {
  console.error(
    "Error: ACADEMIA_USERNAME and ACADEMIA_PASSWORD environment variables must be set."
  );
  console.error("Copy .env.example to .env and fill in your credentials.");
  process.exit(1);
}

async function main() {
  // Step 1: Verify user exists
  console.log("Verifying user...");
  const userResult = await verifyUser(USERNAME);
  console.log("verifyUser:", JSON.stringify(userResult, null, 2));

  if (userResult.error || !userResult.data?.identifier || !userResult.data?.digest) {
    console.error("User verification failed:", userResult.error);
    process.exit(1);
  }

  const { identifier, digest } = userResult.data as { identifier: string; digest: string };

  // Step 2: Verify password and get cookies
  console.log("\nVerifying password...");
  const authResult = await verifyPassword({ identifier, digest, password: PASSWORD });
  console.log("verifyPassword:", JSON.stringify(authResult, null, 2));

  if (!authResult.isAuthenticated || !authResult.data?.cookies) {
    console.error("Authentication failed:", authResult.error);
    process.exit(1);
  }

  const cookies = authResult.data.cookies;

  // Step 3: Fetch timetable
  console.log("\nFetching timetable...");
  const timetableResult = await getTimetable(cookies);
  if (timetableResult.error) {
    console.error("Timetable error:", timetableResult.error);
  } else {
    console.log(
      "timetable:",
      timetableResult.timetable?.length
        ? `${timetableResult.timetable.length} day(s) found`
        : "No timetable data found"
    );
  }

  // Step 4: Fetch attendance
  console.log("\nFetching attendance...");
  const attendanceResult = await getAttendance(cookies);
  if (attendanceResult.error) {
    console.error("Attendance error:", attendanceResult.error);
  } else {
    console.log(
      "attendance:",
      attendanceResult.attendance?.length
        ? `${attendanceResult.attendance.length} course(s) found`
        : "No attendance records found"
    );
  }

  // Step 5: Fetch marks
  console.log("\nFetching marks...");
  const marksResult = await getMarks(cookies);
  if (marksResult.error) {
    console.error("Marks error:", marksResult.error);
  } else {
    console.log(
      "marks:",
      marksResult.markList?.length
        ? `${marksResult.markList.length} course(s) found`
        : "No marks found"
    );
  }

  // Step 6: Fetch course details
  console.log("\nFetching course details...");
  const courseResult = await getCourse(cookies);
  if (courseResult.error) {
    console.error("Course error:", courseResult.error);
  } else {
    console.log(
      "course:",
      courseResult.courseList?.length
        ? `${courseResult.courseList.length} course(s) found`
        : "No courses found"
    );
  }

  // Step 7: Fetch calendar
  console.log("\nFetching calendar...");
  const calendarResult = await getCalendar(cookies);
  if (calendarResult.error) {
    console.error("Calendar error:", calendarResult.error);
  } else {
    console.log(
      "calendar:",
      calendarResult.calendar?.length
        ? `${calendarResult.calendar.length} month(s) found`
        : "No calendar data found"
    );
  }

  // Step 8: Fetch user info
  console.log("\nFetching user info...");
  const userInfoResult = await getUserInfo(cookies);
  if (userInfoResult.error) {
    console.error("User info error:", userInfoResult.error);
  } else {
    console.log("userInfo:", JSON.stringify(userInfoResult.userInfo, null, 2));
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
