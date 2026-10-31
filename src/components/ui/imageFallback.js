// Neutral "image unavailable" tile shown when a product/category photo fails to load
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#F4F1EA"/><g fill="none" stroke="#A8A29E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><rect x="105" y="155" width="90" height="70" rx="8"/><circle cx="130" cy="180" r="8"/><path d="M110 220l28-26 18 16 14-12 24 22"/></g></svg>`
  );

// <img onError={handleImageError} />: swap to the placeholder once, never loop
export const handleImageError = (e) => {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "true";
  img.srcset = "";
  img.src = PLACEHOLDER_IMAGE;
};
