import Mustache from 'mustache'
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

export class Email {

  private static client: Email

  private constructor(private transporter: Mail, private options?: SMTPTransport.Options) {}

  public static build(options?: SMTPTransport.Options): Email {
    if (!Email.client) {
      Email.client = new Email(createTransport(options), options)
    }
    return Email.client
  }

  public async sendEmail(to: string, subject: string, html: string, attachment?: any, params?: any): Promise<any> {
    return await this.transporter.sendMail({
      subject: Mustache.render(subject, params),
      to,
      from: this.options!.from,
      html: Mustache.render(html, params),
      ...attachment ? { attachments: [
          attachment
        ]
      } : {}
    })
  }
}