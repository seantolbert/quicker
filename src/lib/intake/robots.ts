/** Minimal robots.txt check for the "*" and Quicker user agents (longest matching rule wins). */
export const USER_AGENT = "QuickerIntake/1.0 (+site preview builder)";

export function robotsAllows(robotsTxt: string, path: string, agent = "quickerintake") {
  type Rule = { allow: boolean; path: string };
  const groups: { agents: string[]; rules: Rule[] }[] = [];
  let current: { agents: string[]; rules: Rule[] } | null = null;

  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const [, field, value] = [m[0], m[1].toLowerCase(), m[2].trim()];
    if (field === "user-agent") {
      if (!current || current.rules.length) groups.push((current = { agents: [], rules: [] }));
      current.agents.push(value.toLowerCase());
    } else if (current && (field === "allow" || field === "disallow")) {
      if (value) current.rules.push({ allow: field === "allow", path: value });
    }
  }

  const specific = groups.filter((g) => g.agents.some((a) => a !== "*" && agent.includes(a)));
  const rules = (specific.length ? specific : groups.filter((g) => g.agents.includes("*"))).flatMap((g) => g.rules);
  const matches = rules.filter((r) => pathMatches(path, r.path));
  if (!matches.length) return true;
  matches.sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
  return matches[0].allow;
}

function pathMatches(path: string, pattern: string) {
  const re = new RegExp(
    "^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"),
  );
  return re.test(path);
}
