const nodemailer = require("nodemailer");
const pug=require("pug");
const htmlTotext=require("html-to-text");

class Email {
    constructor(user, url) {
        this.email = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = "Swayam Gupta <swayam5705367@gmail.com>"
    }

    newTransport() {
        if (process.env.NODE_ENV == "production"){
            //sendgrid
            return nodemailer.createTransport({
                service: "SendGrid",
                auth:{
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            })
        }
        else {
            //mailtrap:- for testing
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            })
        }
    }

    async send(template, subject) {
        //)1) render html based on pug template
        const html=pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject
        })

        //2) Define mail options
        const mailOptions = {
            from: this.from,
            to: this.email,
            subject,
            html,
            text: htmlTotext.fromString(html)
        }
        //3) create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }
    async sendWelcome() {
        await this.send("welcome", "Welcome To The Natours Family");
    }
    async sendPasswordResetMail() {
        await this.send("passwordReset",`Forgot Your Password? Submit a request with new password and confirmPassword after click the Update Password button. This link is only valid for 10 minutes`);
    }
}

module.exports=Email;




































































































// module.exports = async options => {
//     //1) Create a transporter
//     const transporter= nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     })
//     //2) Define the email Options
//     const mailOptions = {
//         from: "Swayam Gupta <swayam5705367@gmail.com>",
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }

//     //3) Actually send en email
//     await transporter.sendMail(mailOptions);
// }   