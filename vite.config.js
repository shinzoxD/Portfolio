import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import {
  handleContentGet,
  handleContentSave,
  handleAdminLogin,
  handleAdminLogout,
  handleAdminSession,
} from "./src/server/adminApi.js";

function adminApiDevPlugin() {
  return {
    name: "admin-api-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = typeof req.url === "string" ? req.url : "";
        const path = rawUrl.split("?")[0];

        if (path === "/api/admin/session") {
          handleAdminSession(req, res);
          return;
        }
        if (path === "/api/admin/login") {
          await handleAdminLogin(req, res);
          return;
        }
        if (path === "/api/admin/logout") {
          handleAdminLogout(req, res);
          return;
        }
        if (path === "/api/content") {
          if (req.method === "GET") {
            await handleContentGet(req, res);
          } else {
            await handleContentSave(req, res);
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.ADMIN_PIN) process.env.ADMIN_PIN = env.ADMIN_PIN;
  if (env.ADMIN_SESSION_SECRET) process.env.ADMIN_SESSION_SECRET = env.ADMIN_SESSION_SECRET;
  if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;
  if (env.DATABASE_SSL) process.env.DATABASE_SSL = env.DATABASE_SSL;

  return {
    plugins: [react(), adminApiDevPlugin()],
    publicDir: false,
  };
});
