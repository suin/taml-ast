/**
 * TAML AST - Abstract Syntax Tree types and utilities for TAML (Terminal ANSI Markup Language)
 *
 * This package provides a minimal, well-typed AST representation with core node types,
 * visitor patterns, and essential traversal utilities for TAML parsing and manipulation.
 */

// Core types and constants
export type {
  TamlTag,
  NodeType,
  Position,
} from "./types.js";

export {
  STANDARD_COLORS,
  BRIGHT_COLORS,
  BACKGROUND_COLORS,
  TEXT_STYLES,
  VALID_TAGS,
  isValidTag,
  isStandardColor,
  isBrightColor,
  isBackgroundColor,
  isTextStyle,
} from "./types.js";

// AST node interfaces and factory functions
export type {
  TamlNode,
  DocumentNode,
  ElementNode,
  TextNode,
} from "./nodes.js";

export {
  isDocumentNode,
  isElementNode,
  isTextNode,
  createDocument,
  createElement,
  createText,
  appendChild,
  removeChild,
  replaceChild,
  cloneNode,
  getRoot,
  getAncestors,
  getDepth,
} from "./nodes.js";

// Visitor pattern interfaces and utilities
export type {
  Visitor,
  Transformer,
  AsyncVisitor,
} from "./visitor.js";

export {
  visit,
  transform,
  visitAsync,
  createTypedVisitor,
  createCollectorVisitor,
  createCounterVisitor,
} from "./visitor.js";

// Tree traversal utilities
export {
  walk,
  walkAsync,
  findAll,
  findFirst,
  filter,
  getAllText,
  getElementsWithTag,
  getTextNodes,
  getElementNodes,
  contains,
  getCommonAncestor,
  getSiblings,
  getPreviousSibling,
  getNextSibling,
  isEmpty,
  countNodes,
  getMaxDepth,
  flatten,
  createDepthMap,
} from "./traversal.js";
