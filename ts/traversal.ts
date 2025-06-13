/**
 * Tree traversal utilities for TAML AST
 */

import type { ElementNode, TamlNode, TextNode } from "./nodes.js";
import { isDocumentNode, isElementNode, isTextNode } from "./nodes.js";
import type { TamlTag } from "./types.js";

/**
 * Walk through all nodes in the tree (depth-first, pre-order)
 */
export function walk(node: TamlNode, callback: (node: TamlNode) => void): void {
  callback(node);

  if (isDocumentNode(node) || isElementNode(node)) {
    for (const child of node.children) {
      walk(child, callback);
    }
  }
}

/**
 * Walk through all nodes asynchronously
 */
export async function walkAsync(
  node: TamlNode,
  callback: (node: TamlNode) => Promise<void>,
): Promise<void> {
  await callback(node);

  if (isDocumentNode(node) || isElementNode(node)) {
    for (const child of node.children) {
      await walkAsync(child, callback);
    }
  }
}

/**
 * Find all nodes that match a predicate
 */
export function findAll(
  root: TamlNode,
  predicate: (node: TamlNode) => boolean,
): TamlNode[] {
  const results: TamlNode[] = [];

  walk(root, (node) => {
    if (predicate(node)) {
      results.push(node);
    }
  });

  return results;
}

/**
 * Find the first node that matches a predicate
 */
export function findFirst(
  root: TamlNode,
  predicate: (node: TamlNode) => boolean,
): TamlNode | null {
  let result: TamlNode | null = null;

  try {
    walk(root, (node) => {
      if (predicate(node)) {
        result = node;
        throw new Error("Found"); // Break out of walk
      }
    });
  } catch {
    // Expected when we find a match
  }

  return result;
}

/**
 * Filter nodes by predicate (alias for findAll)
 */
export function filter(
  root: TamlNode,
  predicate: (node: TamlNode) => boolean,
): TamlNode[] {
  return findAll(root, predicate);
}

/**
 * Get all text content from a node and its descendants
 */
export function getAllText(root: TamlNode): string {
  const textParts: string[] = [];

  walk(root, (node) => {
    if (isTextNode(node)) {
      textParts.push(node.content);
    }
  });

  return textParts.join("");
}

/**
 * Get all element nodes with a specific tag name
 */
export function getElementsWithTag(
  root: TamlNode,
  tagName: TamlTag,
): ElementNode[] {
  return findAll(
    root,
    (node): node is ElementNode =>
      isElementNode(node) && node.tagName === tagName,
  ) as ElementNode[];
}

/**
 * Get all text nodes
 */
export function getTextNodes(root: TamlNode): TextNode[] {
  return findAll(root, isTextNode) as TextNode[];
}

/**
 * Get all element nodes
 */
export function getElementNodes(root: TamlNode): ElementNode[] {
  return findAll(root, isElementNode) as ElementNode[];
}

/**
 * Check if a node contains another node
 */
export function contains(ancestor: TamlNode, descendant: TamlNode): boolean {
  if (ancestor === descendant) {
    return true;
  }

  if (isDocumentNode(ancestor) || isElementNode(ancestor)) {
    for (const child of ancestor.children) {
      if (contains(child, descendant)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the common ancestor of two nodes
 */
export function getCommonAncestor(
  node1: TamlNode,
  node2: TamlNode,
): TamlNode | null {
  // Get all ancestors of node1
  const ancestors1 = new Set<TamlNode>();
  let current: TamlNode | undefined = node1;

  while (current) {
    ancestors1.add(current);
    current = current.parent;
  }

  // Find first common ancestor in node2's ancestry
  current = node2;
  while (current) {
    if (ancestors1.has(current)) {
      return current;
    }
    current = current.parent;
  }

  return null;
}

/**
 * Get siblings of a node (nodes with the same parent)
 */
export function getSiblings(node: TamlNode): TamlNode[] {
  if (
    !node.parent ||
    (!isDocumentNode(node.parent) && !isElementNode(node.parent))
  ) {
    return [];
  }

  return node.parent.children.filter((child) => child !== node);
}

/**
 * Get the previous sibling of a node
 */
export function getPreviousSibling(node: TamlNode): TamlNode | null {
  if (
    !node.parent ||
    (!isDocumentNode(node.parent) && !isElementNode(node.parent))
  ) {
    return null;
  }

  const index = node.parent.children.indexOf(node);
  return index > 0 ? (node.parent.children[index - 1] ?? null) : null;
}

/**
 * Get the next sibling of a node
 */
export function getNextSibling(node: TamlNode): TamlNode | null {
  if (
    !node.parent ||
    (!isDocumentNode(node.parent) && !isElementNode(node.parent))
  ) {
    return null;
  }

  const index = node.parent.children.indexOf(node);
  return index < node.parent.children.length - 1
    ? (node.parent.children[index + 1] ?? null)
    : null;
}

/**
 * Check if a node is empty (has no children or only empty text)
 */
export function isEmpty(node: TamlNode): boolean {
  if (isTextNode(node)) {
    return node.content.trim() === "";
  }

  if (isDocumentNode(node) || isElementNode(node)) {
    return (
      node.children.length === 0 ||
      node.children.every((child) => isEmpty(child))
    );
  }

  return false;
}

/**
 * Count nodes by type
 */
export function countNodes(root: TamlNode): {
  document: number;
  element: number;
  text: number;
} {
  const counts = { document: 0, element: 0, text: 0 };

  walk(root, (node) => {
    if (isDocumentNode(node)) {
      counts.document++;
    } else if (isElementNode(node)) {
      counts.element++;
    } else if (isTextNode(node)) {
      counts.text++;
    }
  });

  return counts;
}

/**
 * Get the maximum depth of the tree
 */
export function getMaxDepth(root: TamlNode): number {
  let maxDepth = 0;

  function traverse(node: TamlNode, depth: number): void {
    maxDepth = Math.max(maxDepth, depth);

    if (isDocumentNode(node) || isElementNode(node)) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(root, 0);
  return maxDepth;
}

/**
 * Flatten the tree into an array of nodes (depth-first order)
 */
export function flatten(root: TamlNode): TamlNode[] {
  const nodes: TamlNode[] = [];
  walk(root, (node) => nodes.push(node));
  return nodes;
}

/**
 * Create a map from node to its depth in the tree
 */
export function createDepthMap(root: TamlNode): Map<TamlNode, number> {
  const depthMap = new Map<TamlNode, number>();

  function traverse(node: TamlNode, depth: number): void {
    depthMap.set(node, depth);

    if (isDocumentNode(node) || isElementNode(node)) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(root, 0);
  return depthMap;
}
