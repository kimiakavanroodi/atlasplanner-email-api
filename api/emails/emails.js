const { isEmpty } = require("lodash");
const nodemailer = require("nodemailer");
const config = require("../../config/Config");
const { splitDashestoSpaces } = require("../../utils");

const sendRescheduleConfirm = async (req, res) => {
  const domain = req.body.domain;
  const timeslots = req.body.timeslots;

  const bookingName = req.body.booking_name;
  const bookingEmail = req.body.booking_email;

  const orgId = req.body.session._orgId;
  const eventId = req.body.session._eventId;
  const sessionId = req.body.session._id;
  const bookingId = req.body.booking_id;

  const sessionName = req.body.session.name;
  const sessionEmail = req.body.session.email;

  const emailHost = await config.getConfig("EMAIL", 2);
  const emailPass = await config.getConfig("EMAIL_PASS", 2);

  const rescheduleLink = `${domain}/edit-booking/${orgId}/${eventId}/${sessionId}?id=${bookingId}&type=edit`;
  const cancelLink = `${domain}/edit-booking/${orgId}/${eventId}/${sessionId}?id=${bookingId}&type=cancel`;
  const profileLink = `${domain}/profile/${orgId}/${eventId}/${sessionId}?type=bookings`;

  const formattedEventName = splitDashestoSpaces(eventId);

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailHost,
      pass: emailPass,
    },
  });

  transporter.sendMail({
    from: `"Atlasplanner" <${emailHost}>`, // sender address
    to: bookingEmail, // list of receivers
    subject: `${formattedEventName}- You rescheduled your booking`, // Subject line
    text: "", // plain text body
    html: `<p>Hi ${bookingName},</p>
        <p>You have rescheduled your booking for the event ${formattedEventName} to the new date: <strong>${timeslots}</strong>.</p> 
        <p>The owner of this session will be notified of this change.</p>
        <div style="display: flex;">
            <a href="${rescheduleLink}">Reschedule</a>
            <a style="margin-left: 10px;" href="${cancelLink}">Cancel booking</a>
        </div>
        <br />
        <strong>AtlasPlanner</strong>`, // html body
  });

  if (!isEmpty(sessionEmail)) {
    transporter.sendMail({
      from: `"Atlasplanner" <${emailHost}>`, // sender address
      to: sessionEmail, // list of receivers
      subject: `${formattedEventName}- ${bookingName} rescheduled their booking`, // Subject line
      text: "", // plain text body
      html: `<p>Hi ${sessionName},</p>
        <p>${bookingName} has rescheduled their booking with your for the event ${formattedEventName} to the new date: <strong>${timeslots}</strong>.</p> 
        <div style="display: flex;">
            <a href="${profileLink}">View all bookings</a>
        </div>
        <br />
        <strong>AtlasPlanner</strong>`, // html body
    });
  }

  res.status(200).send("Rescheduling email is sent!");
};

const sendSessConfirm = async (req, res) => {
  const userEmail = req.body.email;
  const username = req.body.name;
  const domain = req.body.domain;

  const eventId = req.body.session._eventId;
  const orgId = req.body.session._orgId;
  const sessionId = req.body.session._id;

  const formattedEventName = splitDashestoSpaces(eventId);

  const profileLink = `${domain}/profile/${orgId}/${eventId}/${sessionId}?type=edit`;
  const bookingsLink = `${domain}/profile/${orgId}/${eventId}/${sessionId}?type=bookings`;

  const emailHost = await config.getConfig("EMAIL", 2);
  const emailPass = await config.getConfig("EMAIL_PASS", 2);

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailHost,
      pass: emailPass,
    },
  });

  transporter.sendMail({
    from: `"Atlasplanner" <${emailHost}>`, // sender address
    to: userEmail, // list of receivers
    subject: `${formattedEventName}- Your profile has been created`, // Subject line
    text: "", // plain text body
    html: `<p>Hi ${username},</p>
    <p>Your user profile has been created for the event ${formattedEventName}. You will be notified via email for all bookings or cancellations made by attendees.</p>
    <div style="display: flex;">
        <a href="${profileLink}">Edit profile</a>
        <a style="margin-left: 10px;" href="${bookingsLink}">View bookings</a>
    </div>
    <br />
    <strong>AtlasPlanner</strong>`, // html body
  });

  res.status(200).send("Confirmation email has been sent!");
};

const reserveSession = async (req, res) => {
  const sessionInfo = req.body.session;
  const domain = req.body.domain;

  const orgId = req.body.session._orgId;
  const eventId = req.body.session._eventId;
  const sessionId = req.body.session._id;
  const bookingId = req.body.bookingId;

  const formattedEventName = splitDashestoSpaces(eventId);

  const userCancelLink = `${domain}/edit-booking/${orgId}/${eventId}/${sessionId}?id=${bookingId}&type=cancel`;
  const userRescheduleLink = `${domain}/edit-booking/${orgId}/${eventId}/${sessionId}?id=${bookingId}&type=edit`;
  const mentorProfileLink = `${domain}/profile/${orgId}/${eventId}/${sessionId}?id=${bookingId}&type=bookings`;

  const userBody = {
    name: req.body.name,
    email: req.body.email,
    timeslots: req.body.timeslots,
  };

  const EMAIL_VERSION = 2;

  const emailHost = await config.getConfig("EMAIL", EMAIL_VERSION);
  const emailPass = await config.getConfig("EMAIL_PASS", EMAIL_VERSION);

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailHost,
      pass: emailPass,
    },
  });

  if (sessionInfo["email"]) {
    if (!isEmpty(sessionInfo["email"])) {
      const sendingEmail =
        userBody["email"].length !== 0
          ? userBody["email"]
          : "user has not left contact info";

      const location = sessionInfo.location
        ? sessionInfo.location
        : "user did not leave a location";

      const emailBody = `<p>Hi ${sessionInfo.name},</p>
            <p>${userBody.name} has scheduled time with you for the date: <strong>${userBody.timeslots}</strong>.</p> 
            <p>You plan to meet at: ${location}. If you need to reach the user directly, you can reach them at: ${sendingEmail}.</p>
            <a href="${mentorProfileLink}">Edit & view booking</a>
            <br />
            <strong>AtlasPlanner</strong>`;

      transporter.sendMail({
        from: `"Atlasplanner" <${emailHost}>`, // sender address
        to: sessionInfo.email, // list of receivers
        subject: `${formattedEventName}- ${req.body.name} scheduled time with you!`, // Subject line
        text: "", // plain text body
        html: emailBody, // html body
      });
    }
  }

  if (userBody.email) {
    if (!isEmpty(userBody.email)) {
      var sendingEmail = "";

      if (sessionInfo["email"]) {
        if (sessionInfo["email"].length != 0) {
          sendingEmail = sessionInfo["email"];
        } else {
          sendingEmail = "owner did not add email";
        }
      } else {
        sendingEmail = "owner did not add email";
      }

      const location = sessionInfo.location
        ? sessionInfo.location
        : "user did not leave a location";

      const emailTemplate = `<p>Hi ${userBody.name},</p>
            <p>You have scheduled time with ${sessionInfo.name} for the date: <strong>${userBody.timeslots}</strong>.</p>
            <p>You plan to meet them at: ${location}. If you need to reach the owner, you can reach them at: ${sendingEmail}.</p>

            <div style="display: flex;">
                <a href="${userRescheduleLink}">Reschedule</a>
                <a style="margin-left: 20px" href="${userCancelLink}">Cancel booking</a>
            </div>

            <br />
            <strong>AtlasPlanner</strong>`;

      transporter.sendMail({
        from: `"Atlasplanner" <${emailHost}>`, // sender address
        to: userBody.email, // list of receivers
        subject: `${formattedEventName}- booking confirmation!`, // Subject line
        text: "", // plain text body
        html: emailTemplate, // html body
      });
    }
  }
  res.status(200).send("Sent emails!");
};

const deleteReservation = async (req, res) => {
  const eventId = req.body.session._eventId;
  const formattedEventName = splitDashestoSpaces(eventId);

  let sending_name = req.body.name;
  let sending_email = req.body.email;

  let receiving_name = req.body.session.name;
  let receiving_email = req.body.session.email;

  const timeslots = req.body.timeslots;

  const EMAIL_VERSION = 2;

  var emailHost = await config.getConfig("EMAIL", EMAIL_VERSION);
  var emailPass = await config.getConfig("EMAIL_PASS", EMAIL_VERSION);

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailHost,
      pass: emailPass,
    },
  });

  if (sending_email) {
    if (sending_email.length !== "") {
      var emailBody = `<p>Hi ${sending_name},</p>
            <p>You have successfully cancelled your booking with ${receiving_name} for the date: <strong>${timeslots}</strong></p>
            <p>They have been notified of this change. If you have any questions with the owner of the sessions, please reach them at: ${receiving_email}.</p>
            <br />
            <strong>AtlasPlanner</strong>`;

      transporter.sendMail({
        from: `"Atlasplanner" <${emailHost}>`, // sender address
        to: sending_email, // list of receivers
        subject: `${formattedEventName}- You cancelled your booking with ${receiving_name}`, // Subject line
        text: "", // plain text body
        html: emailBody, // html body
      });
    }
  }

  if (receiving_email) {
    if (receiving_email.length != "") {
      var emailBody = `<p>Hi ${receiving_name},</p>
            <p>${sending_name} has cancelled their booking with you for the date: <strong>${timeslots}</strong>.</p>
            <p>If you need to get in touch with them, you can reach them at: ${sending_email}.</p>
            <br />
            <strong>AtlasPlanner</strong>`;

      transporter.sendMail({
        from: `"Atlasplanner" <${emailHost}>`, // sender address
        to: receiving_email, // list of receivers
        subject: `${formattedEventName}- ${sending_name} cancelled their booking with you`, // Subject line
        text: "", // plain text body
        html: emailBody, // html body
      });
    }
  }
};

const hostCancels = async (req, res) => {
  let guest_name = req.body.name;
  let guest_email = req.body.email;

  let host_name = req.body.session.name;
  let host_email = req.body.session.email;

  const timeslots = req.body.timeslots;
  var location = req.body.location;

  if (location == undefined || location.length == 0) {
    location = "Owner of session did not add a location";
  }

  const EMAIL_VERSION = 2;

  var emailHost = await config.getConfig("EMAIL", EMAIL_VERSION);
  var emailPass = await config.getConfig("EMAIL_PASS", EMAIL_VERSION);

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailHost,
      pass: emailPass,
    },
  });

  if (guest_email) {
    if (guest_email.length != 0) {
      var emailBody = `<p>Hi ${guest_name},</p>
            <p>${host_name} has cancelled your booking on <strong>${timeslots}</strong> at: ${location}.</p>
            <p>If you have any questions about the session or cancellation, please reach them at: ${host_email}.</p>
            <br />
            <strong>AtlasPlanner<strong>`;

      transporter.sendMail({
        from: `"Atlasplanner" <${emailHost}>`, // sender address
        to: guest_email, // list of receivers
        subject: `${host_name} has cancelled your booking`, // Subject line
        text: "", // plain text body
        html: emailBody, // html body
      });
    }
  }
};

module.exports = {
  sendSessConfirm,
  sendRescheduleConfirm,
  reserveSession,
  hostCancels,
  deleteReservation,
};
