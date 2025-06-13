/**
 * Tests for tree traversal utilities
 */

import { expect, test } from "bun:test";
import { createDocument, createElement, createText } from "./nodes.js";
import type { ElementNode, TextNode } from "./nodes.js";
import {
  contains,
  countNodes,
  createDepthMap,
  filter,
  findAll,
  findFirst,
  flatten,
  getAllText,
  getCommonAncestor,
  getElementNodes,
  getElementsWithTag,
  getMaxDepth,
  getNextSibling,
  getPreviousSibling,
  getSiblings,
  getTextNodes,
  isEmpty,
  walk,
  walkAsync,
} from "./traversal.js";

test("walk traverses all nodes in correct order", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const visited: string[] = [];

  walk(doc, (node) => {
    if (node.type === "text") {
      const textNode = node as TextNode;
      visited.push(`${node.type}:${textNode.content}`);
    } else if (node.type === "element") {
      const elementNode = node as ElementNode;
      visited.push(`${node.type}:${elementNode.tagName}`);
    } else {
      visited.push(node.type);
    }
  });

  expect(visited).toEqual([
    "document",
    "element:red",
    "text:Hello",
    "text:World",
  ]);
});

test("walkAsync works with async operations", async () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);

  const visited: string[] = [];

  await walkAsync(element, async (node) => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    visited.push(node.type);
  });

  expect(visited).toEqual(["element", "text"]);
});

test("findAll returns all matching nodes", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const textNodes = findAll(doc, (node) => node.type === "text");

  expect(textNodes).toHaveLength(2);
  expect(textNodes[0]).toBe(text1);
  expect(textNodes[1]).toBe(text2);
});

test("findFirst returns first matching node", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const firstText = findFirst(doc, (node) => node.type === "text");

  expect(firstText).toBe(text1);
});

test("findFirst returns null when no match found", () => {
  const text = createText("Hello");
  const doc = createDocument([text]);

  const element = findFirst(doc, (node) => node.type === "element");

  expect(element).toBeNull();
});

test("filter is alias for findAll", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const filtered = filter(doc, (node) => node.type === "text");
  const found = findAll(doc, (node) => node.type === "text");

  expect(filtered).toEqual(found);
});

test("getAllText extracts all text content", () => {
  const hello = createText("Hello ");
  const world = createText("World");
  const exclamation = createText("!");
  const bold = createElement("bold", [world]);
  const red = createElement("red", [hello, bold, exclamation]);
  const doc = createDocument([red]);

  const allText = getAllText(doc);

  expect(allText).toBe("Hello World!");
});

test("getElementsWithTag returns elements with specific tag", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const red1 = createElement("red", [text1]);
  const blue = createElement("blue", [text2]);
  const red2 = createElement("red", []);
  const doc = createDocument([red1, blue, red2]);

  const redElements = getElementsWithTag(doc, "red");

  expect(redElements).toHaveLength(2);
  expect(redElements[0]).toBe(red1);
  expect(redElements[1]).toBe(red2);
});

test("getTextNodes returns all text nodes", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const textNodes = getTextNodes(doc);

  expect(textNodes).toHaveLength(2);
  expect(textNodes[0]).toBe(text1);
  expect(textNodes[1]).toBe(text2);
});

test("getElementNodes returns all element nodes", () => {
  const text = createText("Hello");
  const bold = createElement("bold", [text]);
  const red = createElement("red", [bold]);
  const doc = createDocument([red]);

  const elementNodes = getElementNodes(doc);

  expect(elementNodes).toHaveLength(2);
  expect(elementNodes[0]).toBe(red);
  expect(elementNodes[1]).toBe(bold);
});

test("contains returns true for descendant nodes", () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);
  const doc = createDocument([element]);

  expect(contains(doc, text)).toBe(true);
  expect(contains(doc, element)).toBe(true);
  expect(contains(doc, doc)).toBe(true);
  expect(contains(element, text)).toBe(true);
  expect(contains(text, element)).toBe(false);
});

test("getCommonAncestor finds common ancestor", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const bold = createElement("bold", [text1]);
  const italic = createElement("italic", [text2]);
  const red = createElement("red", [bold, italic]);
  const doc = createDocument([red]);

  expect(getCommonAncestor(text1, text2)).toBe(red);
  expect(getCommonAncestor(bold, italic)).toBe(red);
  expect(getCommonAncestor(text1, red)).toBe(red);
  expect(getCommonAncestor(doc, text1)).toBe(doc);
});

test("getSiblings returns sibling nodes", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const text3 = createText("!");
  createElement("red", [text1, text2, text3]);

  const siblings1 = getSiblings(text1);
  const siblings2 = getSiblings(text2);

  expect(siblings1).toEqual([text2, text3]);
  expect(siblings2).toEqual([text1, text3]);
});

test("getPreviousSibling returns previous sibling", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const text3 = createText("!");
  createElement("red", [text1, text2, text3]);

  expect(getPreviousSibling(text1)).toBeNull();
  expect(getPreviousSibling(text2)).toBe(text1);
  expect(getPreviousSibling(text3)).toBe(text2);
});

test("getNextSibling returns next sibling", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const text3 = createText("!");
  createElement("red", [text1, text2, text3]);

  expect(getNextSibling(text1)).toBe(text2);
  expect(getNextSibling(text2)).toBe(text3);
  expect(getNextSibling(text3)).toBeNull();
});

test("isEmpty detects empty nodes", () => {
  const emptyText = createText("");
  const whitespaceText = createText("   ");
  const nonEmptyText = createText("Hello");
  const emptyElement = createElement("red", []);
  const elementWithEmptyChildren = createElement("red", [
    emptyText,
    whitespaceText,
  ]);
  const nonEmptyElement = createElement("red", [nonEmptyText]);

  expect(isEmpty(emptyText)).toBe(true);
  expect(isEmpty(whitespaceText)).toBe(true);
  expect(isEmpty(nonEmptyText)).toBe(false);
  expect(isEmpty(emptyElement)).toBe(true);
  expect(isEmpty(elementWithEmptyChildren)).toBe(true);
  expect(isEmpty(nonEmptyElement)).toBe(false);
});

test("countNodes counts nodes by type", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const counts = countNodes(doc);

  expect(counts).toEqual({
    document: 1,
    element: 1,
    text: 2,
  });
});

test("getMaxDepth returns maximum tree depth", () => {
  const text = createText("Hello");
  const bold = createElement("bold", [text]);
  const italic = createElement("italic", [bold]);
  const red = createElement("red", [italic]);
  const doc = createDocument([red]);

  expect(getMaxDepth(doc)).toBe(4);
});

test("flatten returns all nodes in depth-first order", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const nodes = flatten(doc);

  expect(nodes).toEqual([doc, element, text1, text2]);
});

test("createDepthMap maps nodes to their depths", () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);
  const doc = createDocument([element]);

  const depthMap = createDepthMap(doc);

  expect(depthMap.get(doc)).toBe(0);
  expect(depthMap.get(element)).toBe(1);
  expect(depthMap.get(text)).toBe(2);
});
