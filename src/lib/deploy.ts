import { spawn } from "node:child_process";

/**
 * Runs `vercel deploy` in an exported site folder and streams its output.
 * Resolves with the deployment URL (the CLI prints it on stdout).
 */
export function deploy(cwd: string, prod: boolean, onLog: (chunk: string) => void) {
  return new Promise<string>((resolve, reject) => {
    const args = ["deploy", "--yes", ...(prod ? ["--prod"] : [])];
    const child = spawn("vercel", args, { cwd, env: process.env });
    let stdout = "";
    child.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
      onLog(d.toString());
    });
    child.stderr.on("data", (d: Buffer) => onLog(d.toString()));
    child.on("error", (err) =>
      reject(new Error(`Could not run the Vercel CLI (${err.message}). Install it with: npm i -g vercel@latest`)),
    );
    child.on("close", (code) => {
      const url = stdout.match(/https:\/\/\S+/g)?.at(-1);
      if (code === 0 && url) resolve(url);
      else reject(new Error(`vercel deploy exited with code ${code}`));
    });
  });
}
