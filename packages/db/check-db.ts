import { getPrisma } from "./src/index.js";

async function check() {
  const prisma = getPrisma();
  const users = await prisma.user.findMany();
  console.log("Users:", users);
  const workspaces = await prisma.workspace.findMany();
  console.log("Workspaces:", workspaces);
}

check();
