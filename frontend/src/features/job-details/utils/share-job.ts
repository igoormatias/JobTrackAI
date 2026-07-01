export const shareJobUrl = async (url: string, title: string): Promise<"shared" | "copied"> => {
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ url, title });
    return "shared";
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }

  throw new Error("Share not supported");
};
