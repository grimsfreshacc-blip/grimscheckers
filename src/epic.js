import axios from "axios";

// EXCHANGE EPIC CODE FOR ACCESS TOKEN
export async function exchangeCode(code) {
  const res = await axios.post(
    "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
    `grant_type=authorization_code&code=${code}`,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return res.data.access_token;
}

// GET LOCKER WITH ACCESS TOKEN
export async function getLocker(accessToken) {
  const res = await axios.get(
    "https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/accountId/client/QueryProfile?profileId=athena",
    { headers: { Authorization: `bearer ${accessToken}` } }
  );

  const items = res.data.profileChanges[0].profile.items;

  return {
    skin: findItem(items, "AthenaCharacter"),
    backbling: findItem(items, "AthenaBackpack"),
    pickaxe: findItem(items, "AthenaPickaxe"),
    glider: findItem(items, "AthenaGlider"),
    emote: findItem(items, "AthenaDance"),
    exclusive: Object.keys(items)
      .filter(id => items[id].attributes?.rarity === "EFortRarity::Mythic")
  };
}

function findItem(items, type) {
  const entry = Object.entries(items).find(
    ([id, data]) => data.templateId.includes(type)
  );
  return entry ? entry[0] : null;
}
