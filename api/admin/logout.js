import { handleAdminLogout } from "../../src/server/adminApi.js";

export default function handler(req, res) {
  handleAdminLogout(req, res);
}

