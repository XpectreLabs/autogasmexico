'use strict'
const nodemailer = require('nodemailer');
require('dotenv').config();
this.enviar_mail = (codigo,email) => {
    let transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      secure: true,
      secureConnection: false,
      tls: {
        ciphers: "SSLv3",
      },
      requireTLS: true,
      port: 465,
      debug: true,
      connectionTimeout: 10000,
        auth: {
            user: process.env.MAILUSER,
            pass: process.env.MAILPSSWD
        }
    });
    let mail_options = {
        from: 'recovery@xpectrelabs.com',
        to: email,
        subject: 'Solicitud de recuperación de contraseña',
        html: `
        <table border="0" cellpadding="0" cellspacing="0" width="600px" background-color="#2d3436" bgcolor="#2d3436">
        <tr height="200px">
            <td bgcolor="" width="600px">
                <h1 style="color: #fff; text-align:center">Código de recuperación de contraseña</h1>
                <p  style="color: #fff; text-align:center">
                    <span style="color: #e1f292">${codigo}</span> 
                </p>
            </td>
        </tr>
        <tr bgcolor="#fff">
            <td style="text-align:center">
                <p style="color: #000">Si no lo solicitaste, ignóralo</p>
            </td>
        </tr>
        </table>
        `
    };
    transporter.sendMail(mail_options, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('El correo se envío correctamente ' + info.response);
        }
    });
};
module.export = this;