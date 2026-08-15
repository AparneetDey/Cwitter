import { verificationCodeTemplate } from "../templates/verificationCodeTemplate.js";
import { transporter } from "./email.config.js";

const sendVerificationCode = async (email, fullName, verificationCode) => {
    try {
        const info = await transporter.sendMail({
            from: `"Cwitter" ${process.env.SMTP_USER}`, // sender address
            to: email, // list of recipients
            subject: "Verify your email", // subject line
            text: "Verification Code", // plain text body
            html: verificationCodeTemplate(fullName, verificationCode), // HTML body
        });

        // console.log("Message sent: %s", info.messageId);
        // console.log(info);
    } catch (err) {
        console.error("Error while sending mail:", err);
        throw err;
    }
}

export {sendVerificationCode}