const { Router } = require("express");
const {
    isExists
} = require("../controllers/uitlity_controller");

const SessionRouter = Router();

SessionRouter.get("/is-exists", isExists);

module.exports = SessionRouter;
