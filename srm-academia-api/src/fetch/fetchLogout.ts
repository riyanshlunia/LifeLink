export async function fetchLogout(cookie: string) {
  await fetch(
    "https://academia.srmist.edu.in/accounts/p/10002227248/logout?servicename=ZohoCreator&serviceurl=https://academia.srmist.edu.in",
    {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie,
      },
    }
  );
  return { message: "Logout successful", status: 200 };
}
