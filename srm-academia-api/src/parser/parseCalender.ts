import * as cheerio from "cheerio";
import { CalendarResponse, Month } from "../type/calendar";

export async function parseCalendar(
  response: string
): Promise<CalendarResponse> {
  try {
    const $outer = cheerio.load(response);
    const zmlValue = $outer("div.zc-pb-embed-placeholder-content").attr(
      "zmlvalue"
    );

    if (!zmlValue) {
      return { error: "Failed to extract calendar details", status: 404 };
    }

    const $inner = cheerio.load(zmlValue);
    const $mainTable = $inner("table[bgcolor='#FAFCFE']");
    if ($mainTable.length === 0) {
      return { error: "Could not find the main calendar table.", status: 500 };
    }

    const $headerRow = $mainTable.find("tr").first();
    const $ths = $headerRow.find("th");
    const monthsData: Month[] = [];
    for (let i = 0; ; i++) {
      const monthNameThIndex = i * 5 + 2;
      if (monthNameThIndex >= $ths.length) break;
      const monthName = $ths.eq(monthNameThIndex).find("strong").text().trim();
      if (monthName) {
        monthsData.push({ month: monthName, days: [] });
      } else {
        break;
      }
    }

    const $dataRows = $mainTable.find("tr").slice(1).toArray();
    $dataRows.forEach((rowElement) => {
      const $tds = $inner(rowElement).find("td");
      monthsData.forEach((month, monthIndex) => {
        const offset = monthIndex * 5;
        if (offset + 3 >= $tds.length) return;
        const date = $tds.eq(offset).text().trim();
        if (!date) return;
        const day = $tds
          .eq(offset + 1)
          .text()
          .trim();
        const event = $tds
          .eq(offset + 2)
          .find("strong")
          .text()
          .trim();
        const dayOrder = $tds
          .eq(offset + 3)
          .text()
          .trim();
        month.days.push({ date, day, event, dayOrder });
      });
    });

    return { calendar: monthsData, status: 200 };
  } catch (error) {
    console.error("Error parsing calendar:", error);
    return { error: "Failed to parse calendar", status: 500 };
  }
}
