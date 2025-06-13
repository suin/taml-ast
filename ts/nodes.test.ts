/**
 * Tests for AST node creation and manipulation
 */

import { expect, test } from "bun:test";
import {
  appendChild,
  cloneNode,
  createDocument,
  createElement,
  createText,
  getAncestors,
  getDepth,
  getRoot,
  isDocumentNode,
  isElementNode,
  isTextNode,
  removeChild,
  replaceChild,
} from "./nodes.js";

test("createText creates a text node correctly", () => {
  const text = createText("Hello World");

  expect(text.type).toBe("text");
  expect(text.content).toBe("Hello World");
  expect(text.start).toBe(0);
  expect(text.end).toBe(11);
  expect(text.parent).toBeUndefined();
});

test("createElement creates an element node correctly", () => {
  const element = createElement("red");

  expect(element.type).toBe("element");
  expect(element.tagName).toBe("red");
  expect(element.children).toEqual([]);
  expect(element.start).toBe(0);
  expect(element.end).toBe(0);
  expect(element.parent).toBeUndefined();
});

test("createElement with children sets parent references", () => {
  const text = createText("Hello");
  const element = createElement("bold", [text]);

  expect(element.children).toHaveLength(1);
  expect(element.children[0]).toBe(text);
  expect(text.parent).toBe(element);
});

test("createDocument creates a document node correctly", () => {
  const doc = createDocument();

  expect(doc.type).toBe("document");
  expect(doc.children).toEqual([]);
  expect(doc.start).toBe(0);
  expect(doc.end).toBe(0);
  expect(doc.parent).toBeUndefined();
});

test("createDocument with children sets parent references", () => {
  const text = createText("Hello");
  const element = createElement("red", []);
  const doc = createDocument([text, element]);

  expect(doc.children).toHaveLength(2);
  expect(text.parent).toBe(doc);
  expect(element.parent).toBe(doc);
});

test("type guards work correctly", () => {
  const text = createText("text");
  const element = createElement("bold", []);
  const doc = createDocument([]);

  expect(isTextNode(text)).toBe(true);
  expect(isElementNode(text)).toBe(false);
  expect(isDocumentNode(text)).toBe(false);

  expect(isTextNode(element)).toBe(false);
  expect(isElementNode(element)).toBe(true);
  expect(isDocumentNode(element)).toBe(false);

  expect(isTextNode(doc)).toBe(false);
  expect(isElementNode(doc)).toBe(false);
  expect(isDocumentNode(doc)).toBe(true);
});

test("appendChild adds child and sets parent", () => {
  const element = createElement("red");
  const text = createText("Hello");

  appendChild(element, text);

  expect(element.children).toHaveLength(1);
  expect(element.children[0]).toBe(text);
  expect(text.parent).toBe(element);
});

test("removeChild removes child and clears parent", () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);

  expect(element.children).toHaveLength(1);
  expect(text.parent).toBe(element);

  removeChild(text);

  expect(element.children).toHaveLength(0);
  expect(text.parent).toBeUndefined();
});

test("replaceChild replaces child correctly", () => {
  const oldText = createText("Old");
  const newText = createText("New");
  const element = createElement("red", [oldText]);

  replaceChild(element, oldText, newText);

  expect(element.children).toHaveLength(1);
  expect(element.children[0]).toBe(newText);
  expect(newText.parent).toBe(element);
  expect(oldText.parent).toBeUndefined();
});

test("cloneNode creates deep copy of text node", () => {
  const original = createText("Hello", 5, 10);
  const clone = cloneNode(original);

  expect(clone).not.toBe(original);
  expect(clone.type).toBe("text");
  if (isTextNode(clone)) {
    expect(clone.content).toBe("Hello");
  }
  expect(clone.start).toBe(5);
  expect(clone.end).toBe(10);
  expect(clone.parent).toBeUndefined();
});

test("cloneNode creates deep copy of element node", () => {
  const text = createText("Hello");
  const original = createElement("red", [text], 0, 20);
  const clone = cloneNode(original);

  expect(clone).not.toBe(original);
  expect(clone.type).toBe("element");
  expect(isElementNode(clone)).toBe(true);

  if (isElementNode(clone)) {
    expect(clone.tagName).toBe("red");
    expect(clone.start).toBe(0);
    expect(clone.end).toBe(20);
    expect(clone.children).toHaveLength(1);
    expect(clone.children[0]).not.toBe(text); // Should be a different instance

    const firstChild = clone.children[0];
    if (firstChild && isTextNode(firstChild)) {
      expect(firstChild.content).toBe("Hello");
    }

    expect(firstChild?.parent).toBe(clone);
  }
});

test("getRoot returns document node", () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);
  const doc = createDocument([element]);

  expect(getRoot(text)).toBe(doc);
  expect(getRoot(element)).toBe(doc);
  expect(getRoot(doc)).toBe(doc);
});

test("getAncestors returns ancestor chain", () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);
  const doc = createDocument([element]);

  const ancestors = getAncestors(text);
  expect(ancestors).toEqual([element, doc]);

  const elementAncestors = getAncestors(element);
  expect(elementAncestors).toEqual([doc]);

  const docAncestors = getAncestors(doc);
  expect(docAncestors).toEqual([]);
});

test("getDepth returns correct depth", () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);
  const doc = createDocument([element]);

  expect(getDepth(doc)).toBe(0);
  expect(getDepth(element)).toBe(1);
  expect(getDepth(text)).toBe(2);
});

test("complex nested structure works correctly", () => {
  // <red>Hello <bold>World</bold>!</red>
  const hello = createText("Hello ");
  const world = createText("World");
  const exclamation = createText("!");
  const bold = createElement("bold", [world]);
  const red = createElement("red", [hello, bold, exclamation]);
  const doc = createDocument([red]);

  expect(doc.children).toHaveLength(1);
  expect(red.children).toHaveLength(3);
  expect(bold.children).toHaveLength(1);

  expect(hello.parent).toBe(red);
  expect(bold.parent).toBe(red);
  expect(exclamation.parent).toBe(red);
  expect(world.parent).toBe(bold);
  expect(red.parent).toBe(doc);

  expect(getRoot(world)).toBe(doc);
  expect(getDepth(world)).toBe(3);
});
