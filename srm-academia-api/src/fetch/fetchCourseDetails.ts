import axios from "axios";
import { courseDynamicUrl } from "../../utils/dynamicUrl";

export async function fetchCourseDetails(cookie: string) {
  const url = await courseDynamicUrl();
  try {
    const request = await axios(url, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua":
          '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        cookie,
        Referer: "https://academia.srmist.edu.in/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      method: "GET",
    });
    return request.data;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 500
    ) {
      return { error: "Unauthorized", status: 401 };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch course details",
      status:
        error && typeof error === "object" && "status" in error
          ? error.status
          : 500,
    };
  }
}
