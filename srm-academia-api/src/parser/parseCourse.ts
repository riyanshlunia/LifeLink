import * as cheerio from "cheerio";
import { CourseResponse, CourseDetail } from "../type/course";

export async function parseCourseDetails(
  response: string
): Promise<CourseResponse> {
  try {
    const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
    if (!match || !match[1]) {
      return { error: "Failed to extract course details", status: 404 };
    }

    const encodedHtml = match[1];

    const decodedHtml = encodedHtml
      .replace(/\\x([0-9A-Fa-f]{2})/g, (_: string, hex: string) =>
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/\\\\/g, "")
      .replace(/\\'/g, "'");

    const $ = cheerio.load(decodedHtml);

    let batch = "";
    try {
      batch = $("td:contains('Batch:')").next("td").find("font").text().trim();
    } catch {
      batch = "";
    }

    const courseList: CourseDetail[] = Array.from(
      $(".course_tbl tr").slice(1)
    ).map((row) => {
      const columns = $(row).find("td");
      const get = (idx: number) =>
        columns[idx] ? $(columns[idx]).text().trim() : "";
      const getFormat = (idx: number) =>
        get(idx).length === 0 ? "NA" : get(idx);
      const slotRaw = get(8);
      const sortedSlot = slotRaw
        ? slotRaw
            .split("-")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      return {
        courseCode: getFormat(1),
        courseTitle: getFormat(2),
        courseCredit: getFormat(3),
        courseCategory: getFormat(5),
        courseType: getFormat(6),
        courseFaculty: getFormat(7),
        courseSlot: sortedSlot,
        courseRoomNo: getFormat(10).startsWith("AY")
          ? getFormat(9)
          : getFormat(10),
      };
    });

    return { courseList, batch, status: 200 };
  } catch (error) {
    console.error("Error parsing course details:", error);
    return { error: "Failed to parse course details", status: 500 };
  }
}
