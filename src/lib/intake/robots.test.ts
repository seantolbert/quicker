import { expect, it } from "vitest";
import { robotsAllows } from "./robots";

it("applies the longest matching rule for the * group", () => {
  const txt = "User-agent: *\nDisallow: /private\nAllow: /private/public\n\nUser-agent: Googlebot\nDisallow: /";
  expect(robotsAllows(txt, "/")).toBe(true);
  expect(robotsAllows(txt, "/private/x")).toBe(false);
  expect(robotsAllows(txt, "/private/public/y")).toBe(true);
});

it("honors a full disallow and agent-specific groups", () => {
  expect(robotsAllows("User-agent: *\nDisallow: /", "/about")).toBe(false);
  expect(robotsAllows("User-agent: *\nDisallow: /\n\nUser-agent: QuickerIntake\nAllow: /", "/about")).toBe(true);
  expect(robotsAllows("User-agent: *\nDisallow:", "/about")).toBe(true);
});
