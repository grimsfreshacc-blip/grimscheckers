import { getCosmeticImage } from "./fetchCosmeticImage.js";

export async function parseLocker(lockerJson) {
    const categories = ["AthenaCharacter", "AthenaBackpack", "AthenaPickaxe", "AthenaDance"];
    const result = {
        skins: [],
        backblings: [],
        pickaxes: [],
        emotes: []
    };

    for (const item of lockerJson.items || []) {
        const templateId = item.templateId;

        if (templateId.startsWith("AthenaCharacter")) {
            result.skins.push(await getCosmeticImage(templateId));
        }
        if (templateId.startsWith("AthenaBackpack")) {
            result.backblings.push(await getCosmeticImage(templateId));
        }
        if (templateId.startsWith("AthenaPickaxe")) {
            result.pickaxes.push(await getCosmeticImage(templateId));
        }
        if (templateId.startsWith("AthenaDance")) {
            result.emotes.push(await getCosmeticImage(templateId));
        }
    }

    return result;
}
