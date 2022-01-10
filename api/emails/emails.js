const nodemailer = require("nodemailer");
const config = require('../../config/Config');
const { validateCaptcha } = require("../../config/Captcha");
const { json } = require("body-parser");
const request = require("request");
const axios = require("axios")


const sendBulkUploads = async(req, res) => {
    const authHeader = req.headers.authorization
    const subjectLine = req.body.subject

    let orgId = req.params.orgId
    let eventId = req.params.eventId

    const sessions = req.body.sessions
    
    var emailHost = await config.getConfig('EMAIL')
    var emailPass = await config.getConfig('EMAIL_PASS')

    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: emailHost, 
            pass: emailPass, 
        },
    });   

    axios.default.get(`https://atlasplanner.ue.r.appspot.com/events/is-owner/${orgId}/${eventId}`, { 'headers': { 'authorization': authHeader }
    }).then((resp) => {
        if (resp.data) {
            sessions.map((session) => {
                if (session.email) {
                    var emailFormat = req.body.email
                    emailFormat += `<br></br> <p> Click <a title="edit" href=${`https://atlasplanner-e530e.web.app/profile/${session._orgId}/${session._eventId}/${session._id}`}>here</a> to go to your profile. </p>`
                    
                    transporter.sendMail({
                        from: `"Atlasplanner" <${emailHost}>`, 
                        to: session.email, 
                        subject: subjectLine, 
                        text: "",
                        html: emailFormat, 
                    }).then((resp) => {
                        console.log(resp)
                    })
                }
            })

            res.status(200).send('Sent')
        } else {

            res.status(404).send('Not the owner')
        }
      }).catch((err) => {
        res.status(404).send('Not the owner')
    })
}

const sendSessConfirm = async(req, res) => {
    const recaptcha_key = req.body.key

    const emailBody = {
        "name": req.body.name,
        "email": req.body.email,
        "timeslots": req.body.timeslots,
        "editURL": req.body.editURL,
        "link": req.body.link,
        "sessionURL": req.body.sessionURL
    };

    var emailHost = await config.getConfig('EMAIL')
    var emailPass = await config.getConfig('EMAIL_PASS')
    var recaptcha_secret = await config.getConfig('RECAPTCHA_SECRET')

    validateCaptcha(recaptcha_secret, recaptcha_key).then((result) => {
        if (result.success) {

            let transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: emailHost, 
                    pass: emailPass, 
                },
            });

            transporter.sendMail({
                from: `"Atlasplanner" <${emailHost}>`, // sender address
                to: emailBody["email"], // list of receivers
                subject: "User profile created ✔", // Subject line
                text: "", // plain text body
                html: `<p style="text-align: left;"><span style="color: #333333;">Hi ${req.body.name},</span></p>
                <p style="text-align: left;"><span style="color: #333333;">Your user profile has been created. View all bookings & make edits <a title="edit" href=${emailBody.editURL}>here</a>. You will be notified via email of all bookings or cancellations as well.</span></p>
                <p style="text-align: left;"><span style="color: #333333;">Profile Summary</p>
                <p style="text-align: left;"><span style="color: #000000;"><strong>Event Date/Time:</strong></span></p>
                <p style="text-align: left;"><span style="color: #333333;">${emailBody.timeslots}</span></p>
                <p style="text-align: left;"><span style="color: #000000;"><strong>Location:</strong></span></p>
                <p style="text-align: left;"><span style="color: #333333;">${emailBody.link}</span></p>
                <p style="text-align: left;">&nbsp;</p>
                <p style="text-align: left;"><span style="color: #3366ff;"><span style="color: #333333;"><a title="view" href=${emailBody.editURL}>View</a> profile in AtlasPlanner.&nbsp;</span></span></p>
                <p style="text-align: left;">&nbsp;</p>
                <hr />
                <p style="text-align: left;">Sent from <a title="AtlasPlanner" href=${emailBody.editURL}>AtlasPlanner</a></p>`, // html body
            });

            res.status(200).send("Confirmation email has been sent!");
        }
        else {
            res.send("Recaptcha verification failed. Are you a robot?")
        }
    }).catch(reason => {
        console.log("Recaptcha request failure", reason)
        res.send("Recaptcha request failed.")
    })
}

const reserveSession = async(req, res) => {
    const sessionInfo = req.body.session

    const link = {
        "cancel": req.body.cancel,
        "edit": ""
    }

    const userBody = {
        "name": req.body.name,
        "email": req.body.email,
        "timestamp": req.body.timestamp
    };

    var emailHost = await config.getConfig('EMAIL')
    var emailPass = await config.getConfig('EMAIL_PASS')

    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: emailHost, 
            pass: emailPass, 
        },
    });

    if (sessionInfo["email"]) {
        if (sessionInfo["email"].length != "") {
            var sendingEmail = userBody["email"].length != 0 ? userBody["email"] : "user has not left contact info"
            var location = sessionInfo["link"] ? sessionInfo["link"] : "user did not leave a location"

            var emailBody = `<p>Hi ${sessionInfo.name},</p>
            <p>${userBody.name} has reserved a session with you for the date: ${userBody.timestamp}. You plan to meet at: ${location}. If you need to reach the user directly, you can reach them at: ${sendingEmail}.</p>
            <p>- <a href="asdasddas">Atlasplanner</a></p>`

            transporter.sendMail({
                from: `"Atlasplanner" <${emailHost}>`, // sender address
                to: sessionInfo["email"], // list of receivers
                subject: "Someone reserved a session with you! ✔", // Subject line
                text: "", // plain text body
                html: emailBody, // html body
            });
        }
    }

    if (userBody["email"]) {
        if (userBody["email"].length != "") {
            var sendingEmail = ""

            if (sessionInfo["email"]) {
                if (sessionInfo["email"].length != 0) {
                    sendingEmail = sessionInfo["email"]
                } else {
                    sendingEmail = "owner did not add email"
                }
            } else {
                sendingEmail = "owner did not add email"
            }

            var location = sessionInfo["link"] ? sessionInfo["link"] : "user did not leave a location"

            var template = `<p>Hi ${userBody.name},</p>
            <p>You have reserved a session with ${sessionInfo.name} for the date: ${userBody.timestamp}.&nbsp;</p>
            <p>You plan to meet them at: ${location}. If you need to reach the owner, you can reach them at: ${sendingEmail}.</p>

            <p> <a href="${link.cancel}"> Cancel reservation </a> </p>
            <p>- <a href="asdasddas">Atlasplanner</a></p>`

            transporter.sendMail({
                from: `"Atlasplanner" <${emailHost}>`, // sender address
                to: userBody["email"], // list of receivers
                subject: "Reserved a session ✔", // Subject line
                text: "", // plain text body
                html: template, // html body
            });
        }
    }
    res.status(200).send("Sent emails!")

}

const deleteReservation = async(req, res) => {
    let sending_name = req.body.name
    let sending_email = req.body.email

    let receiving_name = req.body.session.name
    let receiving_email = req.body.session.email

    let timestamp = req.body.timestamp

    var emailHost = await config.getConfig('EMAIL')
    var emailPass = await config.getConfig('EMAIL_PASS')

    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: emailHost, 
            pass: emailPass, 
        },
    });

    if (sending_email) {
        if (sending_email.length != "") {

            var emailBody = `<p>Hi ${sending_name},</p>
            <p>You have successfully cancelled your reservation with ${receiving_name} for the date - ${timestamp}. They have been notified of this change. If you have any questions with the owner of the sessions, please reach them at - ${receiving_email}.</p>
            <p>- Atlasplanner</p>`

            transporter.sendMail({
                from: `"Atlasplanner" <${emailHost}>`, // sender address
                to: sending_email, // list of receivers
                subject: `You cancelled your reservation with ${receiving_name} ✔`, // Subject line
                text: "", // plain text body
                html: emailBody, // html body
            });

        }
    }

    if (receiving_email) {
        if (receiving_email.length != "") {

            var emailBody = `<p>Hi ${receiving_name},</p>
            <p>${sending_name} has cancelled a reservation with you for the date: ${timestamp}. If you need to get in touch with them, you can reach them at ${sending_email}.</p>
            <p>- Atlasplanner</p>`

            transporter.sendMail({
                from: `"Atlasplanner" <${emailHost}>`, // sender address
                to: receiving_email, // list of receivers
                subject: `${sending_name} cancelled a reservation with you ✔`, // Subject line
                text: "", // plain text body
                html: emailBody, // html body
            });

        }
    }

};

const hostCancels = async(req, res) => {
    let guest_name = req.body.name
    let guest_email = req.body.email

    let host_name = req.body.session.name
    let host_email = req.body.session.email

    let timestamp = req.body.timestamp
    var location = req.body.location

    if (location == undefined || location.length == 0) {
        location = "Owner of session did not add a location"
    }

    var emailHost = await config.getConfig('EMAIL')
    var emailPass = await config.getConfig('EMAIL_PASS')

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
            <p>${host_name} has cancelled your reservation on ${timestamp} at ${location} for their session with you. If you have any questions about the session or cancellation, please reach them at: ${host_email}.</p>
            <p>-AtlasPlanner&nbsp;</p>`
        
            transporter.sendMail({
                from: `"Atlasplanner" <${emailHost}>`, // sender address
                to: guest_email, // list of receivers
                subject: `${host_name} has cancelled your reservation ✔`, // Subject line
                text: "", // plain text body
                html: emailBody, // html body
            });
        }
    }
}


module.exports = {
    'sendSessConfirm': sendSessConfirm,
    'reserveSession': reserveSession,
    'sendBulkUploads': sendBulkUploads,
    'hostCancels': hostCancels,
    'deleteReservation': deleteReservation,
}
