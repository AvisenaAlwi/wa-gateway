const { config } = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const MainRouter = require("./app/routers");
const errorHandlerMiddleware = require("./app/middlewares/error_middleware");
const whatsapp = require("wa-multi-session");
const axios = require('axios');

config();

var app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");
// Public Path
app.use("/p", express.static(path.resolve("public")));
app.use("/p/*", (req, res) => res.status(404).send("Media Not Found"));

app.use(MainRouter);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || "5000";
app.set("port", PORT);
var server = http.createServer(app);
server.on("listening", () => console.log("APP IS RUNNING ON PORT " + PORT));

server.listen(PORT);
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const sendWebhook = async (session, status, data = null) => {
  var payload = { 
    event: 'connection',
    session: session,
    status: status,
  };

  if (data != null)
    payload.data = data;

  await axios.post(process.env[ session + "_WEBHOOK_URL"], payload, {
    headers: {
      'Content-Type': 'application/json',
      'Accept'      : 'application/json',
    }
  }).then((res) => {
    if (res.status == 200)
      console.log("WEBHOOK SENT SUCCESSFULLY");
  }).catch((err) => {
    console.error("WEBHOOK SENT UNSUCCESSFULLY");
    console.error(err)
  })
}

whatsapp.onConnected(async (session) => {
  console.log("connected => ", session);
  const dataSession = await whatsapp.getSession(session);
  sendWebhook(session, 'connected', {
    phone: dataSession.user.id, 
    name: dataSession?.authState?.creds?.me?.name,
  });
});

whatsapp.onDisconnected((session) => {
  console.log("disconnected => ", session);
  sendWebhook(session, 'disconnected');
});

whatsapp.onConnecting((session) => {
  console.log("connecting => ", session);
  sendWebhook(session, 'connecting');
});

whatsapp.loadSessionsFromStorage();
