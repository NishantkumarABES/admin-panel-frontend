export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);

        // Must have http or https
        if (!["http:", "https:"].includes(parsed.protocol)) return false;

        // Must contain a dot in hostname (ensures real TLD)
        if (!parsed.hostname.includes(".")) return false;

        // Prevent trailing dot or invalid hostnames
        if (parsed.hostname.endsWith(".")) return false;

        return true;
    } catch {
        return false;
    }
}

