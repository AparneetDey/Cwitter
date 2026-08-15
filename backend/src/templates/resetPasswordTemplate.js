export const resetPasswordTemplate = (fullName, temporaryPassword) => (`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cwitter Password Reset</title>
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
            margin: 0 0 20px;
            color: #111827;
        ">
            Password Reset
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
            We received a request to reset the password for your
            Cwitter account.
        </p>

        <p style="
            color: #4b5563;
            font-size: 16px;
            line-height: 1.6;
        ">
            Your temporary password is:
        </p>

        <div style="
            margin: 25px 0;
            padding: 20px;
            background-color: #f3f4f6;
            border-radius: 10px;
            text-align: center;
        ">
            <span style="
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
                color: #111827;
            ">
                ${temporaryPassword}
            </span>
        </div>

        <p style="
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
        ">
            Please use this password to log in and change it to a
            new password of your choice.
        </p>

        <p style="
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
        ">
            If you did not request this password reset, you can
            safely ignore this email.
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