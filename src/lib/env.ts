import { z } from "zod";

type EnvSource = Record<string, string | undefined>;

export type EnvProblem = { missing: string[]; invalid: string[] };
export type EnvResult<T> = { ok: true; value: T } | ({ ok: false } & EnvProblem);

const contactMailSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  CONTACT_MAIL_FROM: z.string().min(1),
});

const githubOAuthSchema = z.object({
  GITHUB_OAUTH_CLIENT_ID: z.string().min(1),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().min(1),
});

function load<S extends z.ZodObject>(schema: S, env: EnvSource): EnvResult<z.infer<S>> {
  const input = Object.fromEntries(
    Object.keys(schema.shape).map((name) => [name, env[name] || undefined]),
  );
  const parsed = schema.safeParse(input);
  if (parsed.success) return { ok: true, value: parsed.data };

  const missing = new Set<string>();
  const invalid = new Set<string>();
  for (const issue of parsed.error.issues) {
    const name = String(issue.path[0]);
    (input[name] === undefined ? missing : invalid).add(name);
  }
  return { ok: false, missing: [...missing], invalid: [...invalid] };
}

export function loadContactMailEnv(env: EnvSource = process.env) {
  return load(contactMailSchema, env);
}

export function loadGithubOAuthEnv(env: EnvSource = process.env) {
  return load(githubOAuthSchema, env);
}

export function describeEnvProblem({ missing, invalid }: EnvProblem): string {
  const parts: string[] = [];
  if (missing.length > 0) parts.push(`missing: ${missing.join(", ")}`);
  if (invalid.length > 0) parts.push(`invalid: ${invalid.join(", ")}`);
  return `Environment variables are not configured correctly (${parts.join("; ")})`;
}
