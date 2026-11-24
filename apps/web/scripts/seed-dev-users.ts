import { randomBytes } from "node:crypto";
import { getDb } from "@mirai/db";
import { users } from "@mirai/db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "../src/lib/auth";

const specs = [
  {
    email: "admin@mirai-lab.local",
    name: "Dev Admin",
    role: "admin" as const,
    passwordEnv: "SEED_ADMIN_PASSWORD",
  },
  {
    email: "editor@mirai-lab.local",
    name: "Dev Editor",
    role: "editor" as const,
    passwordEnv: "SEED_EDITOR_PASSWORD",
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("seed-dev-users must not run in production");
  }

  const auth = getAuth();
  const db = getDb();

  for (const spec of specs) {
    const rows = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.email, spec.email))
      .limit(1);

    let password = process.env[spec.passwordEnv] ?? "";
    if (rows.length === 0) {
      if (!password) password = randomBytes(18).toString("base64url");
      await auth.api.signUpEmail({
        body: { name: spec.name, email: spec.email, password },
      });
      console.log(`CREDENTIAL ${spec.email} ${password}`);
    } else {
      console.log(`EXISTS ${spec.email}`);
    }

    await db
      .update(users)
      .set({ role: spec.role, updatedAt: new Date() })
      .where(eq(users.email, spec.email));

    const after = await db
      .select({ email: users.email, role: users.role })
      .from(users)
      .where(eq(users.email, spec.email))
      .limit(1);
    console.log(`ROLE ${after[0]?.email} ${after[0]?.role}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
