export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  collection: string;
  category: string;
  price: number;
  material: string;
  ref: string;
  description: string;
  details: string[];
  specifications: ProductSpec[];
  images: string[];
  /** Transparent PNG for the AR try-on overlay */
  tryOnImage?: string;
  sizes?: string[];
  isNew: boolean;
}

/* ── Unsplash image sets per product ── */
const IMG = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "aria-chain-necklace",
    name: "Aria Chain Necklace",
    collection: "Essentials",
    category: "necklaces",
    price: 195,
    material: "18k Gold",
    ref: "ADR-NC-001",
    description:
      "A delicate chain necklace in polished 18-karat gold, designed to sit gracefully at the collarbone. The Aria is the quiet centrepiece of any layered look — or a whisper of elegance worn alone.",
    details: [
      "Solid 18k yellow gold",
      "Adjustable length: 40 cm – 45 cm",
      "Lobster clasp closure",
      "Weight: approx. 3.2 g",
      "Handcrafted in Milan",
    ],
    specifications: [
      { label: "Metal", value: "18k Yellow Gold" },
      { label: "Chain Width", value: "1.2 mm" },
      { label: "Length", value: "40–45 cm (adjustable)" },
      { label: "Clasp", value: "Lobster" },
      { label: "Weight", value: "3.2 g" },
      { label: "Hallmark", value: "750 (18k)" },
    ],
    images: [
      IMG("1599643478520-0d9e1a6f7b5c"),
      IMG("1515562141207-7a88fb7ce338"),
      IMG("1611591437281-460bfbe1220a"),
      IMG("1573408301185-9521e7e64b49"),
    ],
    sizes: ["40 cm", "42 cm", "45 cm"],
    isNew: true,
  },
  {
    id: 2,
    slug: "gold-hoop-earrings",
    name: "Gold Hoop Earrings",
    collection: "Everyday Luxe",
    category: "earrings",
    price: 245,
    material: "Gold Vermeil",
    ref: "ADR-ER-002",
    description:
      "Modern hoops reimagined in thick gold vermeil over sterling silver. A perfect circle — bold enough to catch the light, refined enough for every occasion.",
    details: [
      "Gold vermeil (18k gold over sterling silver)",
      "Diameter: 28 mm",
      "Hinged snap closure",
      "Nickel-free, hypoallergenic",
      "Sold as a pair",
    ],
    specifications: [
      { label: "Metal", value: "Gold Vermeil (18k/925)" },
      { label: "Diameter", value: "28 mm" },
      { label: "Thickness", value: "3 mm" },
      { label: "Closure", value: "Hinged Snap" },
      { label: "Weight", value: "6.8 g (pair)" },
      { label: "Hallmark", value: "925" },
    ],
    images: [
      IMG("1506630268828-b184a8aa6fd7"),
      IMG("1599459183200-59c7687a0bdb"),
      IMG("1617038220319-276d3cfab638"),
      IMG("1535632066927-ab7c9ab60908"),
    ],
    isNew: true,
  },
  {
    id: 3,
    slug: "diamond-solitaire-ring",
    name: "Diamond Solitaire Ring",
    collection: "Bridal",
    category: "rings",
    price: 380,
    material: "Platinum",
    ref: "ADR-RG-003",
    description:
      "A timeless solitaire setting in solid platinum, cradling a brilliant-cut diamond. Understated, enduring, and unmistakably elegant.",
    details: [
      "950 Platinum band",
      "0.30 ct brilliant-cut diamond",
      "Colour: G, Clarity: VS1",
      "4-prong cathedral setting",
      "Band width: 1.8 mm",
    ],
    specifications: [
      { label: "Metal", value: "950 Platinum" },
      { label: "Stone", value: "0.30 ct Diamond" },
      { label: "Cut", value: "Brilliant Round" },
      { label: "Colour / Clarity", value: "G / VS1" },
      { label: "Setting", value: "4-Prong Cathedral" },
      { label: "Band Width", value: "1.8 mm" },
    ],
    images: [
      IMG("1535632066927-ab7c9ab60908"),
      IMG("1573408301185-9521e7e64b49"),
      IMG("1515562141207-7a88fb7ce338"),
      IMG("1611591437281-460bfbe1220a"),
    ],
    sizes: ["48 (US 4.5)", "50 (US 5.5)", "52 (US 6)", "54 (US 7)", "56 (US 7.5)"],
    isNew: true,
  },
  {
    id: 4,
    slug: "pearl-strand-bracelet",
    name: "Pearl Strand Bracelet",
    collection: "Heritage",
    category: "bracelets",
    price: 165,
    material: "Sterling Silver",
    ref: "ADR-BR-004",
    description:
      "Freshwater pearls strung on a sterling silver wire with a hand-finished toggle clasp. A gentle nod to classical jewelry, designed for the contemporary wearer.",
    details: [
      "925 Sterling silver clasp and links",
      "5–6 mm freshwater cultured pearls",
      "Toggle clasp closure",
      "Length: 18 cm",
      "Handstrung in Italy",
    ],
    specifications: [
      { label: "Metal", value: "925 Sterling Silver" },
      { label: "Pearls", value: "5–6 mm Freshwater Cultured" },
      { label: "Length", value: "18 cm" },
      { label: "Clasp", value: "Toggle" },
      { label: "Weight", value: "8.5 g" },
      { label: "Origin", value: "Handstrung in Italy" },
    ],
    images: [
      IMG("1515562141207-7a88fb7ce338"),
      IMG("1599643478520-0d9e1a6f7b5c"),
      IMG("1506630268828-b184a8aa6fd7"),
      IMG("1588444837495-c6cfeb53f32d"),
    ],
    sizes: ["16 cm", "18 cm", "20 cm"],
    isNew: true,
  },
  {
    id: 5,
    slug: "18k-gold-plated-bracelet",
    name: "18K Gold Plated Bracelet",
    collection: "Signature",
    category: "bracelets",
    price: 220,
    material: "18K Gold Plated",
    ref: "ADR-BR-005",
    description:
      "A refined bracelet finished in lustrous 18-karat gold plating — lightweight yet substantial, designed to sit perfectly at the wrist and catch the light with every movement.",
    details: [
      "18K gold plated over brass",
      "Adjustable fit",
      "Tarnish-resistant coating",
      "Width: 4 mm",
      "Polished mirror finish",
    ],
    specifications: [
      { label: "Metal", value: "18K Gold Plated Brass" },
      { label: "Width", value: "4 mm" },
      { label: "Finish", value: "High Polish" },
      { label: "Coating", value: "Tarnish-Resistant" },
      { label: "Weight", value: "10.2 g" },
      { label: "Hallmark", value: "18K GP" },
    ],
    images: [
      "/category%20products%20images/18K%20Gold%20plated%20Bracelet.png",
      "/category%20products%20images/8k%20Gold%20Plated%20Bracelet%20model%20.png",
      "/category%20products%20images/18K%20Gold%20plated%20Bracelet.png",
      "/category%20products%20images/8k%20Gold%20Plated%20Bracelet%20model%20.png",
    ],
    tryOnImage: "/products/Bracelets-removebg-preview.png",
    sizes: ["Small (16 cm)", "Medium (18 cm)", "Large (20 cm)"],
    isNew: true,
  },
  {
    id: 6,
    slug: "sapphire-pendant",
    name: "Sapphire Pendant",
    collection: "Gemstone",
    category: "necklaces",
    price: 430,
    material: "18k Gold",
    ref: "ADR-NC-006",
    description:
      "A deep blue sapphire set in a bezel of 18-karat gold, suspended from a fine cable chain. The kind of piece that becomes an heirloom.",
    details: [
      "18k yellow gold bezel and chain",
      "0.45 ct natural sapphire",
      "Bezel diameter: 5 mm",
      "Chain length: 42 cm",
      "Spring ring clasp",
    ],
    specifications: [
      { label: "Metal", value: "18k Yellow Gold" },
      { label: "Stone", value: "0.45 ct Natural Sapphire" },
      { label: "Setting", value: "Bezel" },
      { label: "Chain Length", value: "42 cm" },
      { label: "Pendant", value: "5 mm diameter" },
      { label: "Origin", value: "Sri Lanka (sapphire)" },
    ],
    images: [
      IMG("1610694955371-d15666961977"),
      IMG("1599643478520-0d9e1a6f7b5c"),
      IMG("1573408301185-9521e7e64b49"),
      IMG("1611591437281-460bfbe1220a"),
    ],
    sizes: ["40 cm", "42 cm", "45 cm"],
    isNew: false,
  },
  {
    id: 7,
    slug: "italian-customized-charms-bracelet",
    name: "Italian Customized Charms Bracelet",
    collection: "Milano",
    category: "italian-bracelets",
    price: 310,
    material: "Italian Gold",
    ref: "ADR-BR-007",
    description:
      "Hand-assembled in a Milan atelier, this customized charms bracelet blends heritage Italian craftsmanship with modern personalisation. Each link is individually polished — a hallmark of heritage craft.",
    details: [
      "14k Italian yellow gold",
      "Customizable charm links",
      "Fold-over clasp with safety catch",
      "Length: 19 cm",
      "Made in Milan, Italy",
    ],
    specifications: [
      { label: "Metal", value: "14k Italian Yellow Gold" },
      { label: "Style", value: "Customized Charm Links" },
      { label: "Length", value: "19 cm" },
      { label: "Clasp", value: "Fold-over with Safety" },
      { label: "Weight", value: "18.6 g" },
      { label: "Hallmark", value: "585 Italy" },
    ],
    images: [
      "/category%20products%20images/Italian%20Customized%20Charms%20Bracelet.jpg",
      "/category%20products%20images/Italian%20Customized%20Charms%20Bracelet%20model.jpg",
      "/category%20products%20images/Italian%20Customized%20Charms%20Bracelet.jpg",
      "/category%20products%20images/Italian%20Customized%20Charms%20Bracelet%20model.jpg",
    ],
    tryOnImage: "/products/ItalianBracelets-removebg-preview.png",
    sizes: ["17 cm", "19 cm", "21 cm"],
    isNew: false,
  },
  {
    id: 8,
    slug: "italian-customized-charms-bracelet-gold",
    name: "Italian Customized Charms Bracelet (Gold)",
    collection: "Stories",
    category: "italian-bracelets",
    price: 185,
    material: "Gold Filled",
    ref: "ADR-CH-008",
    description:
      "The gold edition of our Italian Customized Charms Bracelet — the same heritage craftsmanship, elevated with a warm gold-filled finish. Each charm link is individually hand-set for a uniquely personal piece.",
    details: [
      "14k gold-filled charm links",
      "Customizable Italian bracelet",
      "Lobster clasp with safety",
      "Length: 18 cm",
      "Packaged in signature ADORNE box",
    ],
    specifications: [
      { label: "Metal", value: "14k Gold Filled" },
      { label: "Style", value: "Customized Charm Links" },
      { label: "Length", value: "18 cm" },
      { label: "Clasp", value: "Lobster with Safety" },
      { label: "Total Weight", value: "14.8 g" },
      { label: "Packaging", value: "ADORNE Signature Box" },
    ],
    images: [
      "/category%20products%20images/Italian%20Customized%20Charms%20Bracelet%20(Gold).jpg",
      "/category%20products%20images/Italian%20Customized%20Charms%20Bracelet%20(Gold)%20model.jpg",
      "/category%20products%20images/Italian%20Customized%20Charms%20Bracelet%20(Gold).jpg",
      "/category%20products%20images/Italian%20Customized%20Charms%20Bracelet%20(Gold)%20model.jpg",
    ],
    tryOnImage: "/products/ItalianBracelets-removebg-preview.png",
    isNew: false,
  },
  {
    id: 9,
    slug: "vintage-drop-earrings",
    name: "Vintage Drop Earrings",
    collection: "Archive",
    category: "earrings",
    price: 275,
    material: "Antique Gold",
    ref: "ADR-ER-009",
    description:
      "Elongated drop earrings with an antique-gold finish and filigree detailing, inspired by Milanese Art Deco motifs. Each pair is subtly unique due to the hand-finishing process.",
    details: [
      "Brass core with antique-gold plating",
      "Filigree Art Deco motif",
      "Drop length: 42 mm",
      "Post-back with butterfly clutch",
      "Hand-finished patina",
    ],
    specifications: [
      { label: "Metal", value: "Antique Gold Plated Brass" },
      { label: "Drop Length", value: "42 mm" },
      { label: "Width", value: "12 mm" },
      { label: "Closure", value: "Post-back Butterfly" },
      { label: "Weight", value: "5.6 g (pair)" },
      { label: "Finish", value: "Hand-applied Patina" },
    ],
    images: [
      IMG("1599459183200-59c7687a0bdb"),
      IMG("1506630268828-b184a8aa6fd7"),
      IMG("1617038220319-276d3cfab638"),
      IMG("1610694955371-d15666961977"),
    ],
    isNew: false,
  },
  {
    id: 10,
    slug: "eternity-band-ring",
    name: "Eternity Band Ring",
    collection: "Bridal",
    category: "rings",
    price: 495,
    material: "Platinum",
    ref: "ADR-RG-010",
    description:
      "A full-eternity band in 950 platinum, channel-set with brilliant-cut diamonds around the entire circumference. The symbol of an unbroken promise.",
    details: [
      "950 Platinum",
      "Full eternity — diamonds all around",
      "Total carat weight: 0.75 ct",
      "Channel setting",
      "Band width: 2.2 mm",
    ],
    specifications: [
      { label: "Metal", value: "950 Platinum" },
      { label: "Stones", value: "~26 Brilliant-Cut Diamonds" },
      { label: "Total Carat", value: "0.75 ct" },
      { label: "Colour / Clarity", value: "F–G / VS" },
      { label: "Setting", value: "Channel" },
      { label: "Band Width", value: "2.2 mm" },
    ],
    images: [
      IMG("1573408301185-9521e7e64b49"),
      IMG("1535632066927-ab7c9ab60908"),
      IMG("1515562141207-7a88fb7ce338"),
      IMG("1611591437281-460bfbe1220a"),
    ],
    sizes: ["48 (US 4.5)", "50 (US 5.5)", "52 (US 6)", "54 (US 7)", "56 (US 7.5)"],
    isNew: false,
  },
  {
    id: 11,
    slug: "tennis-bracelet",
    name: "Tennis Bracelet",
    collection: "Signature",
    category: "bracelets",
    price: 360,
    material: "Diamond Set",
    ref: "ADR-BR-011",
    description:
      "A classic tennis bracelet in 14-karat white gold, set with a continuous line of prong-set diamonds. Effortless brilliance that moves with every gesture.",
    details: [
      "14k white gold",
      "Total carat weight: 1.00 ct",
      "Prong setting throughout",
      "Box clasp with safety latch",
      "Length: 18 cm",
    ],
    specifications: [
      { label: "Metal", value: "14k White Gold" },
      { label: "Stones", value: "~44 Round Diamonds" },
      { label: "Total Carat", value: "1.00 ct" },
      { label: "Setting", value: "4-Prong Inline" },
      { label: "Length", value: "18 cm" },
      { label: "Clasp", value: "Box with Safety" },
    ],
    images: [
      IMG("1611591437281-460bfbe1220a"),
      IMG("1588444837495-c6cfeb53f32d"),
      IMG("1602173574767-37ac01994b2a"),
      IMG("1573408301185-9521e7e64b49"),
    ],
    sizes: ["16 cm", "18 cm", "20 cm"],
    isNew: false,
  },
  {
    id: 12,
    slug: "layered-necklace-set",
    name: "Layered Necklace Set",
    collection: "Essentials",
    category: "necklaces",
    price: 290,
    material: "Gold Vermeil",
    ref: "ADR-NC-012",
    description:
      "Three individual chains in gold vermeil — 38 cm, 42 cm, and 50 cm — designed to layer together or wear separately. Each chain has a distinct link pattern for textural contrast.",
    details: [
      "Gold vermeil (18k gold over 925 silver)",
      "Set of 3 chains",
      "Lengths: 38 cm / 42 cm / 50 cm",
      "Spring ring clasps",
      "Tarnish-resistant coating",
    ],
    specifications: [
      { label: "Metal", value: "Gold Vermeil (18k/925)" },
      { label: "Pieces", value: "3 Chains" },
      { label: "Lengths", value: "38 / 42 / 50 cm" },
      { label: "Clasps", value: "Spring Ring" },
      { label: "Total Weight", value: "9.8 g" },
      { label: "Finish", value: "Anti-tarnish Coated" },
    ],
    images: [
      IMG("1543294001-f1cd7b5c4e61"),
      IMG("1599643478520-0d9e1a6f7b5c"),
      IMG("1515562141207-7a88fb7ce338"),
      IMG("1610694955371-d15666961977"),
    ],
    isNew: false,
  },
];

export function getProductById(id: number): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.collection === product.collection)
  ).slice(0, count);
}
