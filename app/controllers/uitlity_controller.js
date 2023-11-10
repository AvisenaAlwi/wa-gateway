const whatsapp = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const { responseSuccessWithData } = require("../../utils/response");

exports.isExists = async (req, res, next) => {
    try {
        let to = req.body.to || req.query.to;
        let isGroup = req.body.isGroup || req.query.isGroup;
        const sessionId =
            req.body.session || req.query.session || req.headers.session;

        if (!to || !sessionId) throw new ValidationError("Missing Parameters");

        const receiver = to;
        if (!sessionId) throw new ValidationError("Session Not Founds");
        const isWa = await whatsapp.isExist({
            sessionId,
            to: receiver,
            isGroup: !!isGroup
        });

        res.status(200).json(
            responseSuccessWithData({
                exists: isWa,
            })
        );
    } catch (error) {
        next(error);
    }
};
