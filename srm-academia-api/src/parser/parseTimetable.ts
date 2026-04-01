import * as cheerio from "cheerio";
import { batchSlots } from "../../utils/data";
import {
  SlotInfo,
  TimetableResponse,
  DaySchedule,
  CourseSlot,
} from "../type/timetable";

export async function parseTimetable(
  response: string
): Promise<TimetableResponse> {
  try {
    const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
    if (!match || !match[1]) {
      return { error: "Failed to extract timetable details", status: 404 };
    }

    const encodedHtml = match[1];

    const decodedHtml = encodedHtml
      .replace(/\\x([0-9A-Fa-f]{2})/g, (_: string, hex: string) =>
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/\\\\/g, "")
      .replace(/\\'/g, "'");

    const $ = cheerio.load(decodedHtml);

    const batch = $("td:contains('Batch:')")
      .next("td")
      .find("font")
      .text()
      .trim();

    const courseList = Array.from($(".course_tbl tr").slice(1)).map((row) => {
      const columns = $(row).find("td");
      const get = (idx: number) =>
        columns[idx] ? $(columns[idx]).text().trim() : "";
      const slotRaw = get(8);
      const sortedSlot = slotRaw
        ? slotRaw
            .split("-")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      return {
        courseCode: get(1),
        courseTitle: get(2),
        courseCredit: get(3),
        courseCategory: get(5),
        courseType: get(6),
        courseFaculty: get(7),
        courseSlot: sortedSlot,
        courseRoomNo: get(10).startsWith("AY")
          ? get(9).length === 0
            ? "N/A"
            : get(9)
          : get(10),
      };
    });
    const batchData = batchSlots[parseInt(batch) as keyof typeof batchSlots];

    const slotMap: Record<string, SlotInfo> = {};
    courseList.forEach((course) => {
      course.courseSlot.forEach((slot) => {
        if (slot) {
          slotMap[slot] = {
            courseTitle: course.courseTitle,
            courseCode: course.courseCode,
            courseType: course.courseType,
            courseCategory: course.courseCategory,
            courseRoomNo: course.courseRoomNo,
          };
        }
      });
    });

    const timetable: DaySchedule[] = batchData.slots.map((day) => ({
      dayOrder: day.dayOrder,
      class: day.slots.map((slot, i): CourseSlot => {
        const slotInfo = slotMap[slot]
          ? {
              slot,
              isClass: true,
              courseTitle: slotMap[slot].courseTitle,
              courseCode: slotMap[slot].courseCode,
              courseType: slotMap[slot].courseType,
              courseCategory: slotMap[slot].courseCategory,
              courseRoomNo: slotMap[slot].courseRoomNo,
            }
          : { slot, isClass: false };
        return {
          ...slotInfo,
          time: day.time[i],
        };
      }),
    }));

    return { timetable, status: 200 };
  } catch (error) {
    console.error("Error parsing timetable:", error);
    return { error: "Failed to parse timetable", status: 500 };
  }
}
