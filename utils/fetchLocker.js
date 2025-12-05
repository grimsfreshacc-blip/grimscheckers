import axios from "axios";

export async function fetchLocker(auth) {
  const token = auth.access_token;

  const res = await axios.get(
    "https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/" +
      auth.account_id +
      "/client/QueryProfile?profileId=athena&rvn=-1",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const items = res.data.profileChanges[0].profile.items;

  return {
    skin: Object.keys(items).find(id => items[id].templateId.includes("AthenaCharacter")),
    pickaxe: Object.keys(items).find(id => items[id].templateId.includes("AthenaPickaxe")),
    glider: Object.keys(items).find(id => items[id].templateId.includes("AthenaGlider")),
    backbling: Object.keys(items).find(id => items[id].templateId.includes("AthenaBackpack")),
    emote: Object.keys(items).find(id => items[id].templateId.includes("AthenaDance")),
  };
}
