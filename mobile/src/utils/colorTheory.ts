import { Item } from '../types';

/**
 * Maps HSL and Hex coordinates into fashionable, plain-English color names.
 */
export function getColorName(h: number, s: number, l: number, _hex?: string): string {
  // 1. Extreme lightness checks (Neutrals)
  if (l <= 14) return 'Deep Black';
  if (l >= 88 && s < 25) return 'Crisp White';
  if (l >= 82 && s < 30) return 'Off-White';

  // 2. Low saturation checks (Grays, Beiges, Browns)
  if (s < 16) {
    if (l < 32) return 'Charcoal';
    if (l < 60) return 'Heather Grey';
    if (l < 82) return 'Slate Grey';
    return 'Soft Grey';
  }

  // Warm neutrals & Earth tones
  if (s < 38 && l >= 60 && h >= 25 && h <= 65) return 'Oatmeal Beige';
  if (s < 45 && l < 50 && l >= 25 && h >= 20 && h <= 50) return 'Camel Tan';
  if (s < 35 && l < 25 && h >= 15 && h <= 45) return 'Espresso Brown';

  // 3. Hue-based color naming
  // Reds & Burgundy
  if (h >= 345 || h < 12) {
    if (l < 35) return 'Deep Burgundy';
    if (l > 68) return 'Dusty Rose';
    return 'Ruby Red';
  }

  // Oranges & Terracotta
  if (h >= 12 && h < 45) {
    if (l < 40) return 'Terracotta';
    if (l > 68) return 'Warm Peach';
    return 'Amber';
  }

  // Yellows & Mustard
  if (h >= 45 && h < 68) {
    if (l < 46) return 'Mustard Yellow';
    if (l > 75) return 'Pale Butter';
    return 'Golden Yellow';
  }

  // Greens & Olives
  if (h >= 68 && h < 165) {
    if (h >= 68 && h <= 105 && l < 45) return 'Olive Green';
    if (l < 32) return 'Forest Green';
    if (l > 68) return 'Sage Green';
    return 'Emerald Green';
  }

  // Teals & Cyans
  if (h >= 165 && h < 205) {
    if (l > 65) return 'Mint Seafoam';
    return 'Teal';
  }

  // Blues
  if (h >= 205 && h < 260) {
    if (l < 30) return 'Midnight Navy';
    if (l < 55) return 'Cobalt Blue';
    if (l > 70) return 'Sky Blue';
    return 'Classic Blue';
  }

  // Purples & Violets
  if (h >= 260 && h < 315) {
    if (l < 35) return 'Plum Violet';
    if (l > 68) return 'Soft Lavender';
    return 'Royal Purple';
  }

  // Pinks & Magentas
  if (h >= 315 && h < 345) {
    if (l > 70) return 'Blush Pink';
    return 'Magenta';
  }

  return 'Neutral Shade';
}

function isNeutralHsl(s: number, l: number): boolean {
  return s < 18 || l > 88 || l < 14;
}

function hueDistance(h1: number, h2: number): number {
  const d = Math.abs(h1 - h2) % 360;
  return d > 180 ? 360 - d : d;
}

export interface PairingAnalysis {
  badge: string;
  reasons: string[];
  score: number;
}

/**
 * Produces differentiated, plain-English pairing analysis that names the exact
 * colors and context-aware styling rationale instead of generic repeats.
 */
export function analyzePairing(
  anchor: Item,
  match: Item,
  serverScore: number,
  serverReasons: string[]
): PairingAnalysis {
  const anchorName = getColorName(anchor.h, anchor.s, anchor.l, anchor.colorHex);
  const matchName = getColorName(match.h, match.s, match.l, match.colorHex);
  const aNeutral = isNeutralHsl(anchor.s, anchor.l);
  const bNeutral = isNeutralHsl(match.s, match.l);
  const lDiff = Math.abs(anchor.l - match.l);
  const d = hueDistance(anchor.h, match.h);

  const isDenimMatch =
    (match.category === 'jeans' || match.category === 'pants') &&
    match.h >= 190 &&
    match.h <= 260 &&
    match.s > 12;
  const isDenimAnchor =
    (anchor.category === 'jeans' || anchor.category === 'pants') &&
    anchor.h >= 190 &&
    anchor.h <= 260 &&
    anchor.s > 12;

  // Case A: Both are neutral (e.g. Black + White, Black + Grey, Beige + White)
  if (aNeutral && bNeutral) {
    if (lDiff >= 55) {
      return {
        badge: 'High-Contrast Monochrome',
        score: Math.max(serverScore, 96),
        reasons: [
          `High-contrast monochrome: ${anchorName} against ${matchName} creates a crisp, timeless editorial look.`,
          'Maximum lightness separation defines the silhouette with clean, sharp structure.',
        ],
      };
    }
    if (lDiff >= 25) {
      return {
        badge: 'Tonal Minimalist',
        score: Math.max(serverScore, 91),
        reasons: [
          `Layered grayscale: ${anchorName} pairs naturally with ${matchName} for an understated modern aesthetic.`,
          'Graduated tonal contrast keeps the look balanced without competing tones.',
        ],
      };
    }
    // Very low contrast monochrome (e.g. black on black or grey on grey)
    return {
      badge: 'All-Dark Monochrome',
      score: 87,
      reasons: [
        `All-dark monochrome: ${anchorName} on ${matchName} delivers a sleek, elongating streetwear aesthetic.`,
        'Style with contrasting textures (e.g. matte cotton vs denim) to add depth.',
      ],
    };
  }

  // Case B: One item is neutral anchor, the other has color (e.g. Black Jeans + Colored Top)
  if (aNeutral || bNeutral) {
    const coloredItem = aNeutral ? match : anchor;
    const neutralItem = aNeutral ? anchor : match;
    const cName = aNeutral ? matchName : anchorName;
    const nName = aNeutral ? anchorName : matchName;

    // High saturation pop
    if (coloredItem.s >= 42) {
      const computedScore = Math.min(97, Math.max(serverScore, 93) + (lDiff >= 30 ? 2 : 0));
      return {
        badge: 'Statement Accent',
        score: computedScore,
        reasons: [
          `Vibrant statement: ${nName} acts as a clean anchor, allowing the vivid ${cName} to stand out.`,
          'Neutral grounding absorbs visual noise so the statement color feels intentional, not overwhelming.',
        ],
      };
    }

    // Muted / Earth tone pairing (e.g. Black + Olive, Black + Camel, Black + Dusty Rose)
    if (coloredItem.s >= 16 && coloredItem.s < 42) {
      const computedScore = Math.min(95, Math.max(serverScore, 89) + (lDiff >= 20 ? 3 : 0));
      return {
        badge: 'Muted Sophistication',
        score: computedScore,
        reasons: [
          `Earthy sophistication: ${nName} frames the understated ${cName} for a refined, modern palette.`,
          'Subtle saturation contrast provides a polished, effortlessly curated vibe.',
        ],
      };
    }

    // Low saturation / Dark tone shift (e.g. Black + Midnight Navy)
    return {
      badge: 'Subtle Tonal Shift',
      score: 85,
      reasons: [
        `Moody dark tone pairing: ${nName} and ${cName} sit close in shade for a sleek, low-key profile.`,
        'Pair with varied fabric textures or light accessories to highlight the subtle shift.',
      ],
    };
  }

  // Case C: Neither item is neutral — Color wheel harmonies
  if (d >= 145 && d <= 215) {
    const computedScore = Math.min(98, 92 + (lDiff >= 25 ? 3 : 0) + (isDenimAnchor || isDenimMatch ? 2 : 0));
    return {
      badge: 'Complementary Contrast',
      score: computedScore,
      reasons: [
        `Complementary tension: ${anchorName} and ${matchName} sit opposite on the color wheel for maximum visual pop.`,
        'High energetic balance makes each color appear richer and more vibrant.',
      ],
    };
  }

  if (d <= 35 && lDiff >= 15) {
    const computedScore = Math.min(95, 87 + (lDiff >= 25 ? 3 : 0));
    return {
      badge: 'Monochrome Tone',
      score: computedScore,
      reasons: [
        `Tone-on-tone: ${anchorName} and ${matchName} belong to the same color family with distinct lightness difference.`,
        'Clean shade gradation gives a unified, effortlessly cohesive silhouette.',
      ],
    };
  }

  if (d <= 15 && lDiff < 15) {
    return {
      badge: 'Uniform Monochrome',
      score: 64,
      reasons: [
        `Uniform shades: ${anchorName} and ${matchName} are very close in hue and depth.`,
        'Break up identical tones with a contrasting belt, layer, or shoes to avoid a flat look.',
      ],
    };
  }

  if (d >= 20 && d <= 48) {
    return {
      badge: 'Analogous Blend',
      score: Math.min(94, 88 + (lDiff >= 20 ? 3 : 0)),
      reasons: [
        `Analogous harmony: ${anchorName} and ${matchName} are harmonious color-wheel neighbors that blend smoothly.`,
        'Natural visual transition offers a calm, pleasingly curated outfit palette.',
      ],
    };
  }

  if (d >= 95 && d <= 145) {
    return {
      badge: 'Triadic Energy',
      score: Math.min(90, 83 + (lDiff >= 20 ? 3 : 0)),
      reasons: [
        `Triadic balance: ${anchorName} and ${matchName} form a lively, dynamic geometric harmony.`,
        'Vibrant energy best suited for creative, fashion-forward combinations.',
      ],
    };
  }

  // Fallback / Clashing hues
  return {
    badge: 'Bold Clash',
    score: Math.max(55, Math.min(serverScore, 68)),
    reasons: [
      `Edgy tension: ${anchorName} and ${matchName} feature divergent undertones.`,
      'A daring pairing that requires confident styling and minimalist accessories.',
    ],
  };
}
