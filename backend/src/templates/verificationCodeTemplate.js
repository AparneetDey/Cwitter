export const verificationCodeTemplate = (fullName, verificationCode) => (`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Cwitter account</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f7fb;
    font-family: Arial, Helvetica, sans-serif;
">

    <div style="
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 40px;
        box-sizing: border-box;
    ">

        <h1 style="
            margin: 0 0 10px;
            color: #111827;
            font-size: 28px;
        ">
            Welcome to Cwitter 👋
        </h1>

        <p style="
            color: #4b5563;
            font-size: 16px;
            line-height: 1.6;
        ">
            Hi ${fullName},
        </p>

        <p style="
            color: #4b5563;
            font-size: 16px;
            line-height: 1.6;
        ">
            Thanks for creating your Cwitter account.
            Use the verification code below to verify your email address.
        </p>

        <div style="
            margin: 30px 0;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 10px;
            text-align: center;
        ">
            <div style="
                color: #6b7280;
                font-size: 13px;
                margin-bottom: 8px;
            ">
                VERIFICATION CODE
            </div>

            <div style="
                color: #111827;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
            ">
                ${verificationCode}
            </div>
        </div>

        <p style="
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
        ">
            If you didn't create a Cwitter account, you can safely ignore
            this email.
        </p>

        <hr style="
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
        ">

        <p style="
            margin: 0;
            color: #9ca3af;
            font-size: 13px;
            text-align: center;
        ">
            © ${new Date().getFullYear()} Cwitter. All rights reserved.
        </p>

    </div>

</body>
</html>
`);