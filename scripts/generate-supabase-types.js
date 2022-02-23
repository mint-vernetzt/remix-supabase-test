const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is required");
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY is required");
}

async function run() {
  try {
    const { stdout, stderr } = await exec(
      `openapi-typescript ${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_KEY} --output ./app/supabase-types.ts`
    );
    console.log(stdout);
    console.log(stderr);
  } catch (err) {
    console.error(err);
  }
}

run();
