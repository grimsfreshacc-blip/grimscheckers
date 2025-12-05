export function getImage(cosmetic) {
    return (
        cosmetic?.images?.icon ||
        cosmetic?.images?.featured ||
        "https://via.placeholder.com/256?text=No+Image"
    );
}
