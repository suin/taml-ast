/**
 * Core type definitions for TAML (Terminal ANSI Markup Language) AST
 */

/**
 * All 37 valid TAML tags from the TAML specification
 */
export type TamlTag =
  // Standard colors (8)
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  // Bright colors (8)
  | "brightBlack"
  | "brightRed"
  | "brightGreen"
  | "brightYellow"
  | "brightBlue"
  | "brightMagenta"
  | "brightCyan"
  | "brightWhite"
  // Background colors (16)
  | "bgBlack"
  | "bgRed"
  | "bgGreen"
  | "bgYellow"
  | "bgBlue"
  | "bgMagenta"
  | "bgCyan"
  | "bgWhite"
  | "bgBrightBlack"
  | "bgBrightRed"
  | "bgBrightGreen"
  | "bgBrightYellow"
  | "bgBrightBlue"
  | "bgBrightMagenta"
  | "bgBrightCyan"
  | "bgBrightWhite"
  // Text styles (5)
  | "bold"
  | "dim"
  | "italic"
  | "underline"
  | "strikethrough";

/**
 * AST node type discriminator
 */
export type NodeType = "document" | "element" | "text";

/**
 * Position information for nodes in the source text
 */
export interface Position {
  /** Start position in source text (0-based) */
  start: number;
  /** End position in source text (0-based) */
  end: number;
  /** Line number in source text (1-based) */
  line: number;
  /** Column number in source text (1-based) */
  column: number;
}

/**
 * Standard color names
 */
export const STANDARD_COLORS = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
] as const;

/**
 * Bright color names
 */
export const BRIGHT_COLORS = [
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite",
] as const;

/**
 * Background color names
 */
export const BACKGROUND_COLORS = [
  "bgBlack",
  "bgRed",
  "bgGreen",
  "bgYellow",
  "bgBlue",
  "bgMagenta",
  "bgCyan",
  "bgWhite",
  "bgBrightBlack",
  "bgBrightRed",
  "bgBrightGreen",
  "bgBrightYellow",
  "bgBrightBlue",
  "bgBrightMagenta",
  "bgBrightCyan",
  "bgBrightWhite",
] as const;

/**
 * Text style names
 */
export const TEXT_STYLES = [
  "bold",
  "dim",
  "italic",
  "underline",
  "strikethrough",
] as const;

/**
 * All valid TAML tags as a set for fast lookup
 */
export const VALID_TAGS = new Set<TamlTag>([
  ...STANDARD_COLORS,
  ...BRIGHT_COLORS,
  ...BACKGROUND_COLORS,
  ...TEXT_STYLES,
]);

/**
 * Check if a string is a valid TAML tag
 */
export function isValidTag(tag: string): tag is TamlTag {
  return VALID_TAGS.has(tag as TamlTag);
}

/**
 * Type guard for standard colors
 */
export function isStandardColor(
  tag: TamlTag,
): tag is (typeof STANDARD_COLORS)[number] {
  return (STANDARD_COLORS as readonly string[]).includes(tag);
}

/**
 * Type guard for bright colors
 */
export function isBrightColor(
  tag: TamlTag,
): tag is (typeof BRIGHT_COLORS)[number] {
  return (BRIGHT_COLORS as readonly string[]).includes(tag);
}

/**
 * Type guard for background colors
 */
export function isBackgroundColor(
  tag: TamlTag,
): tag is (typeof BACKGROUND_COLORS)[number] {
  return (BACKGROUND_COLORS as readonly string[]).includes(tag);
}

/**
 * Type guard for text styles
 */
export function isTextStyle(tag: TamlTag): tag is (typeof TEXT_STYLES)[number] {
  return (TEXT_STYLES as readonly string[]).includes(tag);
}
