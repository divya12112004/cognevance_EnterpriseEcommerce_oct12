const transporter = require("./config/email");

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Enterprise E-Commerce - Test Email",
      text: "Nodemailer email notification is working successfully!"
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
}

sendTestEmail();