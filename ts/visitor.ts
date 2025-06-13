/**
 * Visitor pattern implementation for TAML AST
 */

import type { DocumentNode, ElementNode, TamlNode, TextNode } from "./nodes.js";
import { isDocumentNode, isElementNode, isTextNode } from "./nodes.js";

/**
 * Visitor interface for traversing and processing AST nodes
 */
export interface Visitor {
  /** Called when visiting a document node */
  visitDocument?(node: DocumentNode): void;
  /** Called when visiting an element node */
  visitElement?(node: ElementNode): void;
  /** Called when visiting a text node */
  visitText?(node: TextNode): void;
  /** Called before visiting children (pre-order) */
  enterNode?(node: TamlNode): void;
  /** Called after visiting children (post-order) */
  exitNode?(node: TamlNode): void;
}

/**
 * Transformer interface for converting AST nodes to other types
 */
export interface Transformer<T = TamlNode> {
  /** Transform a document node */
  visitDocument?(node: DocumentNode): T;
  /** Transform an element node */
  visitElement?(node: ElementNode): T;
  /** Transform a text node */
  visitText?(node: TextNode): T;
}

/**
 * Visit an AST node and its children using the visitor pattern
 */
export function visit(node: TamlNode, visitor: Visitor): void {
  // Call enter hook if provided
  visitor.enterNode?.(node);

  // Visit the node based on its type
  if (isDocumentNode(node)) {
    visitor.visitDocument?.(node);
    // Visit children
    for (const child of node.children) {
      visit(child, visitor);
    }
  } else if (isElementNode(node)) {
    visitor.visitElement?.(node);
    // Visit children
    for (const child of node.children) {
      visit(child, visitor);
    }
  } else if (isTextNode(node)) {
    visitor.visitText?.(node);
  }

  // Call exit hook if provided
  visitor.exitNode?.(node);
}

/**
 * Transform an AST node using the transformer pattern
 */
export function transform<T>(node: TamlNode, transformer: Transformer<T>): T {
  if (isDocumentNode(node)) {
    if (transformer.visitDocument) {
      return transformer.visitDocument(node);
    }
  } else if (isElementNode(node)) {
    if (transformer.visitElement) {
      return transformer.visitElement(node);
    }
  } else if (isTextNode(node)) {
    if (transformer.visitText) {
      return transformer.visitText(node);
    }
  }

  throw new Error(`No transformer method found for node type: ${node.type}`);
}

/**
 * Visit nodes asynchronously
 */
export async function visitAsync(
  node: TamlNode,
  visitor: AsyncVisitor,
): Promise<void> {
  // Call enter hook if provided
  await visitor.enterNode?.(node);

  // Visit the node based on its type
  if (isDocumentNode(node)) {
    await visitor.visitDocument?.(node);
    // Visit children
    for (const child of node.children) {
      await visitAsync(child, visitor);
    }
  } else if (isElementNode(node)) {
    await visitor.visitElement?.(node);
    // Visit children
    for (const child of node.children) {
      await visitAsync(child, visitor);
    }
  } else if (isTextNode(node)) {
    await visitor.visitText?.(node);
  }

  // Call exit hook if provided
  await visitor.exitNode?.(node);
}

/**
 * Async visitor interface
 */
export interface AsyncVisitor {
  /** Called when visiting a document node */
  visitDocument?(node: DocumentNode): Promise<void>;
  /** Called when visiting an element node */
  visitElement?(node: ElementNode): Promise<void>;
  /** Called when visiting a text node */
  visitText?(node: TextNode): Promise<void>;
  /** Called before visiting children (pre-order) */
  enterNode?(node: TamlNode): Promise<void>;
  /** Called after visiting children (post-order) */
  exitNode?(node: TamlNode): Promise<void>;
}

/**
 * Create a visitor that only visits specific node types
 */
export function createTypedVisitor<T extends TamlNode>(
  nodeTest: (node: TamlNode) => node is T,
  callback: (node: T) => void,
): Visitor {
  return {
    enterNode(node: TamlNode) {
      if (nodeTest(node)) {
        callback(node);
      }
    },
  };
}

/**
 * Create a visitor that collects nodes of a specific type
 */
export function createCollectorVisitor<T extends TamlNode>(
  nodeTest: (node: TamlNode) => node is T,
): Visitor & { nodes: T[] } {
  const nodes: T[] = [];

  return {
    nodes,
    enterNode(node: TamlNode) {
      if (nodeTest(node)) {
        nodes.push(node);
      }
    },
  };
}

/**
 * Create a visitor that counts nodes by type
 */
export function createCounterVisitor(): Visitor & {
  counts: { document: number; element: number; text: number };
} {
  const counts = {
    document: 0,
    element: 0,
    text: 0,
  };

  return {
    counts,
    visitDocument() {
      counts.document++;
    },
    visitElement() {
      counts.element++;
    },
    visitText() {
      counts.text++;
    },
  };
}
