import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import Module from "node:module";
import ts from "typescript";
const instance = new Module("gallery-state");
instance._compile(ts.transpileModule(readFileSync("components/property/gallery-state.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, "gallery-state");
const { galleryReducer: reduce, initialGalleryState: initial, adjacentIndices } = instance.exports;
const loaded = index => ({ type: "loaded", index, width: 800, height: 1200 });
const next = { type: "navigate", delta: 1, count: 7 };
test("initial state and bounded adjacent preload", () => {
  assert.equal(initial.displayed, 0);
  assert.deepEqual(initial.loaded, {});
  assert.deepEqual(adjacentIndices(0, 7), [1, 6]);
  assert.deepEqual(adjacentIndices(0, 1), []);
  assert.deepEqual(adjacentIndices(0, 2), [1]);
});
test("display and counter retain current image until latest target loads", () => {
  let state = reduce(initial, loaded(0));
  state = reduce(state, next);
  assert.equal(state.displayed, 0);
  state = reduce(state, next);
  state = reduce(state, loaded(1));
  assert.equal(state.displayed, 0);
  state = reduce(state, loaded(2));
  assert.equal(state.displayed, 2);
  assert.equal(state.target, 2);
  assert.deepEqual(state.loaded[2], { width: 800, height: 1200 });
});
test("failed target retains displayed photo and navigation recovers", () => {
  let state = reduce(reduce(initial, loaded(0)), next);
  state = reduce(state, { type: "failed", index: 1 });
  assert.equal(state.displayed, 0);
  assert.equal(state.failed, true);
  state = reduce(state, next);
  state = reduce(state, loaded(2));
  assert.equal(state.displayed, 2);
  assert.equal(state.failed, false);
});
test("rapid next next next previous next honours latest intent", () => {
  let state = reduce(initial, loaded(0));
  for (const delta of [1, 1, 1, -1, 1]) state = reduce(state, { ...next, delta });
  state = reduce(state, loaded(2));
  assert.equal(state.displayed, 0);
  state = reduce(state, loaded(3));
  assert.equal(state.displayed, 3);
});
test("opacity-only reduced motion and intrinsic contain geometry remain", () => {
  const source = readFileSync("components/property/PropertyGallery.tsx", "utf8");
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(source, /duration: reducedMotion \? 0 : 0\.2/);
  assert.match(source, /await image.decode\(\)/);
  assert.match(source, /getImageProps/);
  assert.match(css, /object-fit: contain/);
  assert.match(css, /--media-ratio/);
  assert.match(css, /prefers-reduced-motion: reduce.*gallery-skeleton.*animation: none/);
});
