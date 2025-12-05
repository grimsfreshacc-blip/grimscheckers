import axios from "axios";

const EPIC_TOKEN = "basic ZWM2ZjRhZGZiOTRkND..."; // unchanged default fortnite launcher token

export async function startDeviceAuth() {
  const response = await axios.post(
    "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/deviceAuthorization",
    new URLSearchParams({}),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": EPIC_TOKEN
      }
    }
  );

  return response.data;
}

export async function pollDeviceAuth(deviceCode) {
  try {
    const res = await axios.post(
      "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
      new URLSearchParams({
        grant_type: "device_code",
        device_code: deviceCode
      }),
      { headers: { Authorization: EPIC_TOKEN } }
    );

    return res.data.access_token;

  } catch (err) {
    if (err.response?.data?.error === "authorization_pending")
      return "authorization_pending";

    throw err;
  }
}

export async function getLockerData(accessToken) {
  const response = await axios.get(
    "https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/lookup",
    { headers: { Authorization: `bearer ${accessToken}` } }
  );

  const accountId = response.data.id;

  const locker = await axios.post(
    `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${accountId}/client/QueryProfile?profileId=athena`,
    {},
    { headers: { Authorization: `bearer ${accessToken}` } }
  );

  return locker.data;
}
