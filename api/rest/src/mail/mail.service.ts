import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 465),
        secure: Number(process.env.SMTP_PORT || 465) === 465,
        auth: { user, pass },
      });
      this.logger.log(`Mail transporter configured for ${user} via ${host}`);
    } else {
      this.logger.warn(
        'SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing). Emails will be logged to console only.',
      );
    }
  }

  private from(): string {
    return process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@switchgod.com.np';
  }

  private baseUrl(): string {
    return process.env.FRONTEND_URL || 'https://switchgod.com.np';
  }

  async sendMail({ to, subject, html }: MailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[EMAIL-LOG] to=${to} subject="${subject}" html=${html}`);
      return true;
    }
    try {
      await this.transporter.sendMail({
        from: `"SwitchGod Bazar" <${this.from()}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to} — ${subject}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Email to ${to} failed: ${error.message}`);
      return false;
    }
  }

  private layout(title: string, body: string): string {
    return `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f7f7">
        <div style="background:#ffffff;border-radius:8px;padding:32px;border:1px solid #e5e7eb">
          <h2 style="color:#111827;margin:0 0 16px;font-size:20px">${title}</h2>
          ${body}
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px">
            SwitchGod Bazar — ${this.baseUrl()}
          </p>
        </div>
      </div>`;
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
    const html = this.layout(
      'Password Reset Request',
      `
        <p style="color:#374151">You requested to reset your password. Use the code below to continue:</p>
        <div style="background:#f3f4f6;border-radius:6px;padding:16px;text-align:center;font-size:24px;font-weight:bold;letter-spacing:8px;color:#111827">${token}</div>
        <p style="color:#374151">This code is valid for <strong>30 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
      `,
    );
    return this.sendMail({
      to,
      subject: 'SwitchGod Bazar — Password Reset Code',
      html,
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const html = this.layout(
      `Welcome to SwitchGod Bazar, ${name}!`,
      `
        <p style="color:#374151">Your account has been created successfully. You can now log in and start shopping.</p>
        <p><a href="${this.baseUrl()}" style="background:#111827;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Visit the store</a></p>
      `,
    );
    return this.sendMail({
      to,
      subject: 'Welcome to SwitchGod Bazar',
      html,
    });
  }

  async sendShopCreatedEmail(
    to: string,
    shopName: string,
    approved: boolean,
  ): Promise<boolean> {
    const status = approved ? 'approved and live' : 'submitted for review';
    const html = this.layout(
      `Shop "${shopName}" ${status}`,
      `
        <p style="color:#374151">Your shop <strong>${shopName}</strong> has been ${status}.</p>
        ${approved
          ? `<p><a href="${this.baseUrl()}" style="background:#111827;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">View your shop</a></p>`
          : '<p style="color:#374151">An admin will review it shortly. You will receive an email once it is approved.</p>'}
      `,
    );
    return this.sendMail({
      to,
      subject: `Shop "${shopName}" — ${approved ? 'Approved' : 'Submitted'}`,
      html,
    });
  }

  async sendOrderEmail(
    to: string,
    orderId: string,
    total: number | string,
    subject: string,
  ): Promise<boolean> {
    const html = this.layout(
      subject,
      `
        <p style="color:#374151">Order <strong>#${orderId}</strong> has been placed.</p>
        <p style="color:#374151">Total: <strong>${total}</strong></p>
        <p><a href="${this.baseUrl()}" style="background:#111827;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">View order</a></p>
      `,
    );
    return this.sendMail({ to, subject, html });
  }
}
