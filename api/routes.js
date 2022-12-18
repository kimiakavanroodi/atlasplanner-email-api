const express = require("express");
const emailRoutes = require("./emails/emails");
const cors = require('cors');

module.exports = function(app) {
    app.use(express.json());
    app.use(cors())

    app.post("/confirmation", emailRoutes.sendSessConfirm);
    app.post("/reschedule-confirmation", emailRoutes.sendRescheduleConfirm);
    app.post("/host-cancels", emailRoutes.hostCancels);
    app.post("/reserve-email", emailRoutes.reserveSession);
    app.post("/cancel-email", emailRoutes.deleteReservation);
};