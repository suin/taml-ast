/**
 * Tests for visitor pattern implementation
 */

import { expect, test } from "bun:test";
import { createDocument, createElement, createText } from "./nodes.js";
import {
  createCollectorVisitor,
  createCounterVisitor,
  createTypedVisitor,
  transform,
  visit,
  visitAsync,
} from "./visitor.js";

test("visit calls appropriate visitor methods", () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);
  const doc = createDocument([element]);

  const visited: string[] = [];

  visit(doc, {
    visitDocument: () => visited.push("document"),
    visitElement: (node) => visited.push(`element:${node.tagName}`),
    visitText: (node) => visited.push(`text:${node.content}`),
  });

  expect(visited).toEqual(["document", "element:red", "text:Hello"]);
});

test("visit calls enter and exit hooks", () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);
  const doc = createDocument([element]);

  const events: string[] = [];

  visit(doc, {
    enterNode: (node) => events.push(`enter:${node.type}`),
    exitNode: (node) => events.push(`exit:${node.type}`),
  });

  expect(events).toEqual([
    "enter:document",
    "enter:element",
    "enter:text",
    "exit:text",
    "exit:element",
    "exit:document",
  ]);
});

test("transform converts nodes correctly", () => {
  const text = createText("Hello");

  const result = transform(text, {
    visitText: (node) => `Text: ${node.content}`,
  });

  expect(result).toBe("Text: Hello");
});

test("visitAsync works with async operations", async () => {
  const text = createText("Hello");
  const element = createElement("red", [text]);

  const visited: string[] = [];

  await visitAsync(element, {
    visitElement: async (node) => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      visited.push(`element:${node.tagName}`);
    },
    visitText: async (node) => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      visited.push(`text:${node.content}`);
    },
  });

  expect(visited).toEqual(["element:red", "text:Hello"]);
});

test("createTypedVisitor only visits matching nodes", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const textContents: string[] = [];

  const textVisitor = createTypedVisitor(
    (node): node is import("./nodes.js").TextNode => node.type === "text",
    (node) => textContents.push(node.content),
  );

  visit(doc, textVisitor);

  expect(textContents).toEqual(["Hello", "World"]);
});

test("createCollectorVisitor collects matching nodes", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const collector = createCollectorVisitor(
    (node): node is import("./nodes.js").TextNode => node.type === "text",
  );

  visit(doc, collector);

  expect(collector.nodes).toHaveLength(2);
  expect(collector.nodes[0]).toBe(text1);
  expect(collector.nodes[1]).toBe(text2);
});

test("createCounterVisitor counts nodes by type", () => {
  const text1 = createText("Hello");
  const text2 = createText("World");
  const element = createElement("red", [text1, text2]);
  const doc = createDocument([element]);

  const counter = createCounterVisitor();

  visit(doc, counter);

  expect(counter.counts).toEqual({
    document: 1,
    element: 1,
    text: 2,
  });
});

test("visitor works with complex nested structure", () => {
  // <red>Hello <bold>beautiful</bold> world!</red>
  const hello = createText("Hello ");
  const beautiful = createText("beautiful");
  const world = createText(" world!");
  const bold = createElement("bold", [beautiful]);
  const red = createElement("red", [hello, bold, world]);
  const doc = createDocument([red]);

  const visited: string[] = [];

  visit(doc, {
    visitDocument: () => visited.push("doc"),
    visitElement: (node) => visited.push(node.tagName),
    visitText: (node) => visited.push(node.content.trim()),
  });

  expect(visited).toEqual([
    "doc",
    "red",
    "Hello",
    "bold",
    "beautiful",
    "world!",
  ]);
});
