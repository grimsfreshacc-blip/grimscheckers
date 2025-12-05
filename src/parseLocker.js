export function parseLocker(locker) {
    const categories = {
        skins: [],
        backblings: [],
        pickaxes: [],
        emotes: [],
        gliders: [],
        wraps: [],
        exclusives: []
    };

    for (const item of locker.items) {
        const type = item.type?.value?.toLowerCase() || "unknown";

        if (type.includes("outfit")) categories.skins.push(item);
        else if (type.includes("backpack")) categories.backblings.push(item);
        else if (type.includes("pickaxe")) categories.pickaxes.push(item);
        else if (type.includes("emote")) categories.emotes.push(item);
        else if (type.includes("glider")) categories.gliders.push(item);
        else if (type.includes("wrap")) categories.wraps.push(item);

        if (item.series?.value === "platform_series") {
            categories.exclusives.push(item);
        }
    }

    return categories;
}
