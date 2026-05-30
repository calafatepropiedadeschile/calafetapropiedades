import nodemailer from 'nodemailer';
import type { LeadInput } from '@/features/leads/lead.schemas';
import { siteConfig } from '@/config/site';

type LeadPropertySummary = {
  title: string;
  slug: string;
} | null;

type LeadNotificationInput = {
  lead: LeadInput;
  property: LeadPropertySummary;
};

type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  to: string[];
};

function getBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return value === 'true' || value === '1' || value === 'yes';
}

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const recipients = process.env.LEAD_NOTIFICATION_TO?.split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  if (!host || !user || !password || !recipients?.length) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = getBooleanEnv('SMTP_SECURE', port === 465);

  return {
    host,
    port: Number.isFinite(port) ? port : 465,
    secure,
    user,
    password,
    from: process.env.LEAD_NOTIFICATION_FROM?.trim() || `${siteConfig.name} <${user}>`,
    to: recipients,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getPropertyUrl(property: LeadPropertySummary) {
  if (!property) return null;

  const origin = process.env.APP_ORIGIN || process.env.AUTH_URL;
  if (!origin) return `/propiedades/${property.slug}`;

  return `${origin.replace(/\/$/, '')}/propiedades/${property.slug}`;
}

function buildLeadEmail({ lead, property }: LeadNotificationInput) {
  const propertyUrl = getPropertyUrl(property);
  const subject = property
    ? `Nueva consulta por propiedad: ${property.title}`
    : `Nueva consulta desde ${siteConfig.name}`;

  const campaignLine = lead.utmCampaign ? `Campaña UTM: ${lead.utmCampaign}` : null;
  const landingLine = lead.landingPath ? `Landing: ${lead.landingPath}` : null;

  const textLines = [
    `Nueva consulta recibida en ${siteConfig.name}`,
    '',
    `Nombre: ${lead.name}`,
    `Email: ${lead.email}`,
    `Telefono: ${lead.phone || '-'}`,
    property ? `Propiedad: ${property.title}` : 'Origen: Formulario de contacto',
    propertyUrl ? `URL: ${propertyUrl}` : null,
    campaignLine,
    landingLine,
    lead.utmSource ? `utm_source: ${lead.utmSource}` : null,
    lead.utmMedium ? `utm_medium: ${lead.utmMedium}` : null,
    '',
    'Mensaje:',
    lead.message || '-',
  ].filter((line): line is string => line !== null);

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2933;line-height:1.5">
      <h2 style="margin:0 0 16px">Nueva consulta recibida</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        <tbody>
          <tr><td style="padding:8px 0;font-weight:700">Nombre</td><td>${escapeHtml(lead.name)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700">Email</td><td>${escapeHtml(lead.email)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700">Telefono</td><td>${escapeHtml(lead.phone || '-')}</td></tr>
          <tr><td style="padding:8px 0;font-weight:700">Origen</td><td>${property ? escapeHtml(property.title) : 'Formulario de contacto'}</td></tr>
          ${propertyUrl ? `<tr><td style="padding:8px 0;font-weight:700">URL</td><td><a href="${escapeHtml(propertyUrl)}">${escapeHtml(propertyUrl)}</a></td></tr>` : ''}
          ${lead.utmCampaign ? `<tr><td style="padding:8px 0;font-weight:700">Campaña</td><td>${escapeHtml(lead.utmCampaign)}</td></tr>` : ''}
          ${lead.landingPath ? `<tr><td style="padding:8px 0;font-weight:700">Landing</td><td>${escapeHtml(lead.landingPath)}</td></tr>` : ''}
          ${lead.utmSource ? `<tr><td style="padding:8px 0;font-weight:700">utm_source</td><td>${escapeHtml(lead.utmSource)}</td></tr>` : ''}
          ${lead.utmMedium ? `<tr><td style="padding:8px 0;font-weight:700">utm_medium</td><td>${escapeHtml(lead.utmMedium)}</td></tr>` : ''}
        </tbody>
      </table>
      <div style="margin-top:20px">
        <strong>Mensaje</strong>
        <p style="white-space:pre-line;background:#f6f7f9;padding:16px;border-radius:8px">${escapeHtml(lead.message || '-')}</p>
      </div>
    </div>
  `;

  return {
    subject,
    text: textLines.join('\n'),
    html,
  };
}

export async function sendLeadNotification(input: LeadNotificationInput) {
  const config = getEmailConfig();

  if (!config) {
    console.warn('Lead email notification skipped because SMTP is not configured.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  const email = buildLeadEmail(input);

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: input.lead.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}
