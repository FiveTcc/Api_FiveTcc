import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import 'dotenv/config';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS ?? process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPass) {
  throw new Error(
    'Credenciais de e-mail ausentes. Defina EMAIL_USER e EMAIL_PASSWORD (ou EMAIL_PASS).',
  );
}

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  async enviarRecuperacao(email: string, nome: string, link: string) {
    await this.transporter.sendMail({
      from: `"N.O.S - New Occurrence System" <${process.env.EMAIL_USER}>`,

      to: email,

      subject: 'Recuperação de senha - N.O.S',

      html: `
        <div style="font-family: Arial, sans-serif;">

          <h2>Recuperação de senha</h2>

          <p>Olá, ${nome}!</p>

          <p>
            Recebemos uma solicitação para redefinir
            sua senha.
          </p>

          <p>
            Clique no botão abaixo para criar uma nova senha:
          </p>

          <a
            href="${link}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Redefinir minha senha
          </a>

          <p>
            Este link expira em 15 minutos.
          </p>

          <p>
            Se você não solicitou essa alteração,
            ignore este e-mail.
          </p>

        </div>
      `,
    });
  }
}
