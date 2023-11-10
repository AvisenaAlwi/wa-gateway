const { Router } = require("express");
const {
  createSession,
  getSession,
  deleteSession,
  sessions,
} = require("../controllers/session_controller");

const SessionRouter = Router();

SessionRouter.post("/start-session", createSession);
SessionRouter.get("/session", getSession);
SessionRouter.delete("/delete-session", deleteSession);
SessionRouter.get("/sessions", sessions);

module.exports = SessionRouter;
