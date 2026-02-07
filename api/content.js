import { handleContentGet, handleContentSave } from "../src/server/adminApi.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    await handleContentGet(req, res);
    return;
  }
  await handleContentSave(req, res);
}
