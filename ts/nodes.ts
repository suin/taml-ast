/**
 * AST node interfaces and factory functions for TAML
 */

import type { NodeType, TamlTag } from "./types.js";

/**
 * Base interface for all AST nodes
 */
export interface TamlNode {
  /** Node type discriminator */
  type: NodeType;
  /** Start position in source text (0-based) */
  start: number;
  /** End position in source text (0-based) */
  end: number;
  /** Parent node reference (undefined for root) */
  parent?: TamlNode | undefined;
}

/**
 * Document root node containing all top-level nodes
 */
export interface DocumentNode extends TamlNode {
  type: "document";
  children: TamlNode[];
}

/**
 * Element node representing a TAML tag with children
 */
export interface ElementNode extends TamlNode {
  type: "element";
  tagName: TamlTag;
  children: TamlNode[];
}

/**
 * Text node containing plain text content
 */
export interface TextNode extends TamlNode {
  type: "text";
  content: string;
}

/**
 * Type guard to check if a node is a DocumentNode
 */
export function isDocumentNode(node: TamlNode): node is DocumentNode {
  return node.type === "document";
}

/**
 * Type guard to check if a node is an ElementNode
 */
export function isElementNode(node: TamlNode): node is ElementNode {
  return node.type === "element";
}

/**
 * Type guard to check if a node is a TextNode
 */
export function isTextNode(node: TamlNode): node is TextNode {
  return node.type === "text";
}

/**
 * Factory function to create a document node
 */
export function createDocument(
  children: TamlNode[] = [],
  start = 0,
  end = 0,
): DocumentNode {
  const document: DocumentNode = {
    type: "document",
    children: [],
    start,
    end,
  };

  // Set parent references and add children
  for (const child of children) {
    child.parent = document;
    document.children.push(child);
  }

  return document;
}

/**
 * Factory function to create an element node
 */
export function createElement(
  tagName: TamlTag,
  children: TamlNode[] = [],
  start = 0,
  end = 0,
): ElementNode {
  const element: ElementNode = {
    type: "element",
    tagName,
    children: [],
    start,
    end,
  };

  // Set parent references and add children
  for (const child of children) {
    child.parent = element;
    element.children.push(child);
  }

  return element;
}

/**
 * Factory function to create a text node
 */
export function createText(
  content: string,
  start = 0,
  end = content.length,
): TextNode {
  return {
    type: "text",
    content,
    start,
    end,
  };
}

/**
 * Add a child node to a parent node (document or element)
 */
export function appendChild(
  parent: DocumentNode | ElementNode,
  child: TamlNode,
): void {
  child.parent = parent;
  parent.children.push(child);
}

/**
 * Remove a child node from its parent
 */
export function removeChild(child: TamlNode): void {
  if (!child.parent) {
    return;
  }

  if (isDocumentNode(child.parent) || isElementNode(child.parent)) {
    const index = child.parent.children.indexOf(child);
    if (index !== -1) {
      child.parent.children.splice(index, 1);
      child.parent = undefined;
    }
  }
}

/**
 * Replace a child node with a new node
 */
export function replaceChild(
  parent: DocumentNode | ElementNode,
  oldChild: TamlNode,
  newChild: TamlNode,
): void {
  const index = parent.children.indexOf(oldChild);
  if (index !== -1) {
    oldChild.parent = undefined;
    newChild.parent = parent;
    parent.children[index] = newChild;
  }
}

/**
 * Clone a node and its subtree
 */
export function cloneNode(node: TamlNode): TamlNode {
  if (isTextNode(node)) {
    return createText(node.content, node.start, node.end);
  }

  if (isElementNode(node)) {
    const clonedChildren = node.children.map((child) => cloneNode(child));
    return createElement(node.tagName, clonedChildren, node.start, node.end);
  }

  if (isDocumentNode(node)) {
    const clonedChildren = node.children.map((child) => cloneNode(child));
    return createDocument(clonedChildren, node.start, node.end);
  }

  throw new Error(`Unknown node type: ${node.type}`);
}

/**
 * Get the root document node for any node
 */
export function getRoot(node: TamlNode): DocumentNode {
  let current = node;
  while (current.parent) {
    current = current.parent;
  }

  if (!isDocumentNode(current)) {
    throw new Error("Root node is not a document node");
  }

  return current;
}

/**
 * Get all ancestors of a node (from parent to root)
 */
export function getAncestors(node: TamlNode): TamlNode[] {
  const ancestors: TamlNode[] = [];
  let current = node.parent;

  while (current) {
    ancestors.push(current);
    current = current.parent;
  }

  return ancestors;
}

/**
 * Get the depth of a node (distance from root)
 */
export function getDepth(node: TamlNode): number {
  let depth = 0;
  let current = node.parent;

  while (current) {
    depth++;
    current = current.parent;
  }

  return depth;
}
