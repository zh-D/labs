const nodemailer = require("nodemailer")
const password = require('./password')

async function sendEmail() {

    let transporter = nodemailer.createTransport({
        service: 'qq',
        host: "smtp.qq.email",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: "1641245614@qq.com", // generated ethereal user
            pass: password, // generated ethereal password
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    })

    let mailOpts = {
        from: '"dzh" <1641245614@qq.com>', // sender address
        to: "1921935083@qq.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    }


    let info = await transporter.sendMail(mailOpts)
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}


sendEmail().catch(console.error);