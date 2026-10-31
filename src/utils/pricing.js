/**
 * Variant pricing for the storefront.
 * Mirrors backend/src/utils/variantPricing.js — keep both in sync so the shown price equals the charged price.
 *
 * A cart line's variant label is the selected value of every attribute, in attribute order,
 * joined with " / " (e.g. "M" or "40mm / Obsidian"). Legacy products without attributes use the size alone.
 */
export const VARIANT_SEPARATOR = " / ";

const roundMoney = (n) => Math.round((Number(n) || 0) * 100) / 100;

export const getLegacySizes = (product) =>
  Array.isArray(product?.sizes)
    ? product.sizes
    : typeof product?.sizes === "string"
      ? product.sizes.split(" ").filter(Boolean)
      : [];

// Options a shopper chooses from; legacy products with only a `sizes` list behave like one "Size" option
export const getAttributes = (product) => {
  const attributes = Array.isArray(product?.attributes) ? product.attributes.filter((a) => a?.values?.length > 0) : [];
  if (attributes.length > 0) return attributes;
  const sizes = getLegacySizes(product);
  return sizes.length > 0 ? [{ name: "Size", values: sizes }] : [];
};

// Does the shopper have to choose something before adding to cart?
export const hasVariantChoices = (product) => getAttributes(product).length > 0;

// Label for a selection map { [attributeName]: value }
export const buildVariantLabel = (product, selected = {}) => {
  const attributes = getAttributes(product);
  if (attributes.length === 0) return "Standard";
  return attributes.map((a) => selected[a.name] ?? a.values[0]).join(VARIANT_SEPARATOR);
};

export const parseVariantLabel = (product, label) => {
  const parts = String(label || "").split(VARIANT_SEPARATOR).map((p) => p.trim());
  const selected = {};
  getAttributes(product).forEach((attr, i) => {
    if (attr.values.includes(parts[i])) {
      selected[attr.name] = parts[i];
    } else {
      const match = parts.find((p) => attr.values.includes(p));
      if (match) selected[attr.name] = match;
    }
  });
  return selected;
};

// Why this label isn't a purchasable option of the product, or null if it is (same rule as the server)
export const getVariantLabelError = (product, label) => {
  if (typeof label !== "string" || !label.trim() || label.includes(".") || label.startsWith("$")) {
    return "Invalid product option";
  }
  const attributes = getAttributes(product);
  if (attributes.length > 0) {
    const selected = parseVariantLabel(product, label);
    const missing = attributes.find((a) => !selected[a.name]);
    return missing ? `Please select a ${missing.name} for '${product.name}'` : null;
  }
  return label === "Standard" ? null : "Invalid product option";
};

// The size value tracked in sizeStock for this label, if any
export const getVariantSizeValue = (product, label) => {
  const selected = parseVariantLabel(product, label);
  const sizeAttr = getAttributes(product).find((a) => ["size", "sizes"].includes(a.name.toLowerCase()));
  return sizeAttr && selected[sizeAttr.name] ? selected[sizeAttr.name] : null;
};

export const getPriceDelta = (product, attribute, value) => {
  const entry = (product?.variantPrices || []).find((vp) => vp.attribute === attribute && vp.value === value);
  return entry ? Number(entry.priceDelta) || 0 : 0;
};

// Price before discount for a label
export const getVariantListPrice = (product, label) => {
  const selected = parseVariantLabel(product, label);
  const adjustments = Object.entries(selected).reduce((sum, [attr, val]) => sum + getPriceDelta(product, attr, val), 0);
  return Math.max(0, roundMoney((Number(product?.price) || 0) + adjustments));
};

export const getDiscountPercent = (product) => Math.min(100, Math.max(0, Number(product?.discount) || 0));

// What the customer pays per unit — same formula as checkout
export const getUnitPrice = (product, label) =>
  roundMoney(getVariantListPrice(product, label) * (1 - getDiscountPercent(product) / 100));

// Lowest list price (before discount) across options. Options in `fixed` use their own price.
export const getStartingListPrice = (product, fixed = {}) => {
  const base = Number(product?.price) || 0;
  const minAdjustment = getAttributes(product).reduce((sum, attr) => {
    if (fixed[attr.name] !== undefined) return sum + getPriceDelta(product, attr.name, fixed[attr.name]);
    const deltas = attr.values.map((v) => getPriceDelta(product, attr.name, v));
    return sum + Math.min(0, ...deltas);
  }, 0);
  return Math.max(0, roundMoney(base + minAdjustment));
};

// Lowest payable price across options, for "From $X" on cards
export const getStartingPrice = (product, fixed = {}) =>
  roundMoney(getStartingListPrice(product, fixed) * (1 - getDiscountPercent(product) / 100));

export const hasPriceVariation = (product) => (product?.variantPrices || []).some((vp) => Number(vp.priceDelta));

// Do options of attributes outside `fixed` still change the price?
export const hasRemainingPriceVariation = (product, fixed = {}) =>
  (product?.variantPrices || []).some((vp) => Number(vp.priceDelta) && fixed[vp.attribute] === undefined);

const isSizeAttribute = (name) => ["size", "sizes"].includes(String(name).toLowerCase());

export const getImageSrc = (img) => (typeof img === "object" && img?.src ? img.src : img);

export const getImageList = (product) =>
  (Array.isArray(product?.image) ? product.image : [product?.image]).map(getImageSrc).filter(Boolean);

/**
 * Which photo belongs to which option. Uses the admin-assigned links when the product has any;
 * otherwise pairs photos with options by position, but only when one non-size attribute
 * has exactly as many options as there are photos (e.g. 2 colors, 2 photos).
 * Same rule as getVariantImage in backend/src/utils/variantPricing.js.
 */
export const getVariantImageLinks = (product) => {
  const images = getImageList(product);

  if (Array.isArray(product?.variantImages) && product.variantImages.length > 0) {
    return product.variantImages.filter((l) => images.includes(l.image));
  }

  if (images.length < 2) return [];
  const match = getAttributes(product).find((a) => !isSizeAttribute(a.name) && a.values.length === images.length);
  return match ? match.values.map((value, i) => ({ attribute: match.name, value, image: images[i] })) : [];
};

// Photo for a selection map { [attributeName]: value } (first linked option wins), else the main photo
export const getImageForSelection = (product, selected = {}) => {
  const link = getVariantImageLinks(product).find((l) => selected[l.attribute] === l.value);
  return link ? link.image : getImageList(product)[0];
};

// Photo for a cart label
export const getVariantImage = (product, label) => getImageForSelection(product, parseVariantLabel(product, label));

/**
 * The option a product card lets shoppers flip through: the attribute that has photos linked,
 * else the one whose options change the price, else the first non-size attribute.
 */
export const getCardAttribute = (product) => {
  const attributes = getAttributes(product);
  const linked = new Set(getVariantImageLinks(product).map((l) => l.attribute));
  const priced = new Set((product?.variantPrices || []).filter((vp) => Number(vp.priceDelta)).map((vp) => vp.attribute));
  return (
    attributes.find((a) => linked.has(a.name)) ||
    attributes.find((a) => priced.has(a.name)) ||
    attributes.find((a) => !isSizeAttribute(a.name)) ||
    null
  );
};

// Units available for a cart label (per-size stock when tracked, else total stock)
export const getVariantStock = (product, label) => {
  const total = product?.stock !== undefined ? Number(product.stock) : 50;
  const sizeValue = getVariantSizeValue(product, label);
  const perSize = sizeValue && product?.sizeStock ? product.sizeStock[sizeValue] : undefined;
  return perSize !== undefined ? Math.min(total, Number(perSize)) : total;
};

// "$144" for whole amounts, "$143.10" otherwise
export const formatPrice = (amount, currency = "$") => {
  const n = roundMoney(amount);
  return `${currency}${Number.isInteger(n) ? n : n.toFixed(2)}`;
};

// Always two decimals, for totals
export const formatMoney = (amount, currency = "$") => `${currency}${roundMoney(amount).toFixed(2)}`;
