import { handleAdminSession } from "../../src/server/adminApi.js";

export default function handler(req, res) {
  handleAdminSession(req, res);
}

