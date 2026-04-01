import * as cheerio from "cheerio";
import { UserInfoResponse, UserInfo } from "../type/user";

export async function parseUserInfo(
  response: string
): Promise<UserInfoResponse> {
  try {
    const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);
    if (!match || !match[1]) {
      return { error: "Failed to extract user details", status: 404 };
    }

    const encodedHtml = match[1];

    const decodedHtml = encodedHtml
      .replace(/\\x([0-9A-Fa-f]{2})/g, (_: string, hex: string) =>
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/\\\\/g, "")
      .replace(/\\'/g, "'");

    const $ = cheerio.load(decodedHtml);

    const getText = (selector: string) => $(selector).text().trim();
    const userInfo: UserInfo = {
      regNumber: getText('td:contains("Registration Number:") + td strong'),
      name: getText('td:contains("Name:") + td strong'),
      mobile: getText('td:contains("Mobile:") + td strong'),
      section: getText('td:contains("Department:") + td strong')
        .split("-")[1]
        .replace("(", "")
        .replace(")", "")
        .replace("Section", "")
        .trim(),
      program: getText('td:contains("Program:") + td strong'),
      department: getText('td:contains("Department:") + td strong')
        .split("-")[0]
        .trim(),

      semester: getText('td:contains("Semester:") + td strong'),
      batch: getText('td:contains("Batch:") + td strong font'),
    };

    return { userInfo, status: 200 };
  } catch (error) {
    console.error("Error parsing user info:", error);
    return { error: "Failed to parse user info", status: 500 };
  }
}
