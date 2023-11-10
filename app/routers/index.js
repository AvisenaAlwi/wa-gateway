const { Router } = require("express");
const MessageRouter = require("./message_router");
const SessionRouter = require("./session_router");
const UtilityRouter = require("./utility_router");

const MainRouter = Router();

MainRouter.use(SessionRouter);
MainRouter.use(MessageRouter);
MainRouter.use(UtilityRouter);

module.exports = MainRouter;
