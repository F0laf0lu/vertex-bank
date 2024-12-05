import nodemailer from 'nodemailer';
import path from 'path'
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailTemplate = path.join(`${__dirname}`, '..', 'template/email.html')

const template = readFileSync(emailTemplate, 'utf-8')



class EmailService{
    constructor(){}
    static async sendForgotPasswordLink(user, code){
        const subject = 'Forgot Password'
        const message = `This is the code to reset your account password <b>${code}</b>. If this request was not made by you, kindly ignore`
        return this.sendMail(user.email, subject, message, user.username)
    }

    static replaceTemplateConstants(_template, key, data){
        const regex = new RegExp(key, 'g');
        return _template.replace(regex, data)
    }


    static async sendMail(to, subject, message, username){
        const appName = 'Vertex Bank'
        const supportMail = 'support@vertexbank.com'
        const name = username
        let html = this.replaceTemplateConstants(template, '#APP_NAME#', appName)
        html = this.replaceTemplateConstants(html, '#NAME#', name)
        html = this.replaceTemplateConstants(html, '#MESSAGE#', message)
        html = this.replaceTemplateConstants(html, '#SUPPORT_MAIL#', supportMail)

        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: supportMail,
            to,
            subject,
            text: message,
            html: html
        };

        const infoMail = await transport.sendMail(mailOptions)
        return infoMail
    }
}


export default EmailService