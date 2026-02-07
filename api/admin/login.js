import { handleAdminLogin } from "../../src/server/adminApi.js";

export default async function handler(req, res) {
  await handleAdminLogin(req, res);
}

