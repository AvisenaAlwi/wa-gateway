const { toDataURL } = require("qrcode");
const whatsapp = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const {
  responseSuccessWithMessage,
  responseSuccessWithData,
} = require("../../utils/response");
const axios = require('axios');

exports.createSession = async (req, res, next) => {
  try {
    const scan = req.body.scan || req.query.scan || req.headers.scan;
    const sessionName = req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new Error("Bad Request");
    }
    whatsapp.onQRUpdated(async (data) => {
      const qr = await toDataURL(data.qr);
      const session = data.sessionId;

      const payload = {
        event: 'qrcode_update',
        session: session,
        qrcode: qr,
      };

      axios.post(process.env[ session + "_WEBHOOK_URL"], payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept'      : 'application/json',
        }
      }).then((res) => {
        if (res.status == 200)
          console.log("WEBHOOK QRUPDATE SENT SUCCESSFULLY");
      }).catch((err) => {
        console.error("WEBHOOK QRUPDTE SENT UNSUCCESSFULLY");
        console.error(err.response.data)
      })


      if (res && !res.headersSent) {
        if (scan && data.sessionId == sessionName) {
          res.render("scan", { qr: qr });
        } else {
          res.status(200).json(
            responseSuccessWithData({
              qr: qr,
            })
          );
        }
      }
    });
    await whatsapp.startSession(sessionName, { printQR: true });
  } catch (error) {
    next(error);
  }
};
exports.deleteSession = async (req, res, next) => {
  try {
    const sessionName =
      req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new ValidationError("session Required");
    }
    whatsapp.deleteSession(sessionName);
    res
      .status(200)
      .json(responseSuccessWithMessage("Success Deleted " + sessionName));
  } catch (error) {
    next(error);
  }
};
exports.sessions = async (req, res, next) => {
  try {
    const key = req.body.key || req.query.key || req.headers.key;

    // is KEY provided and secured
    if (process.env.KEY && process.env.KEY != key) {
      throw new ValidationError("Invalid Key");
    }

    res.status(200).json(responseSuccessWithData(whatsapp.getAllSession()));
  } catch (error) {
    next(error);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const sessionName = req.body.session || req.query.session || req.headers.session;
    if (!sessionName) {
      throw new ValidationError("Bad Request");
    }
    res.status(200).json(responseSuccessWithData( whatsapp.getSession(sessionName) ));
  } catch (error) {
    next(error);
  }
}