import nodemailer from "nodemailer"

// Create a transporter using SMTP
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: "cwitterugabuga@gmail.com",
    pass: "sjoz yris uaoc rsgr",
  },
});