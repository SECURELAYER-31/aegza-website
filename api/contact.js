const { Resend } = require('resend');

const allowedProjects = new Set([
  'LLM Evaluation', 'AI Response Evaluation', 'Text Annotation', 'Image Annotation',
  'Video Annotation', 'Audio / Transcription', 'Data Collection', 'Multimodal Evaluation',
  'Quality Assurance', 'Other'
]);
const fields = ['fullName', 'company', 'email', 'projectType', 'volume', 'timeline', 'message'];
const limits = { fullName: 120, company: 160, email: 254, projectType: 80, volume: 120, timeline: 120, message: 4000 };
const recentRequests = new Map();
const processedSubmissions = new Map();

const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

module.exports = async (request, response) => {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const contentType = request.headers?.['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) return response.status(415).json({ error: 'Unsupported content type' });
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL || !process.env.FROM_EMAIL) return response.status(503).json({ error: 'Contact service is not configured' });

  const ip = request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown';
  const lastRequest = recentRequests.get(ip);
  if (lastRequest && Date.now() - lastRequest < 60_000) return response.status(429).json({ error: 'Please wait before sending another inquiry' });

  const body = request.body || {};
  if (JSON.stringify(body).length > 12_000) return response.status(413).json({ error: 'Submission is too large' });
  const submissionId = clean(body.submissionId, 80);
  if (!submissionId) return response.status(400).json({ error: 'Invalid submission' });
  if (processedSubmissions.has(submissionId)) return response.status(409).json({ error: 'Duplicate submission' });
  if (clean(body.website, 100)) return response.status(400).json({ error: 'Invalid submission' });
  const data = Object.fromEntries(fields.map((field) => [field, clean(body[field], limits[field])]));
  if (fields.some((field) => typeof body[field] === 'string' && body[field].length > limits[field])) return response.status(400).json({ error: 'One or more fields are too long' });
  if (!data.fullName || !data.email || !data.projectType || !data.message || !isEmail(data.email) || !allowedProjects.has(data.projectType)) return response.status(400).json({ error: 'Please provide valid required fields' });

  recentRequests.set(ip, Date.now());
  const timestamp = new Date().toISOString();
  const rows = fields.map((field) => `<tr><td style="padding:8px 0;color:#64748b;width:180px">${field}</td><td style="padding:8px 0;color:#0f172a">${escapeHtml(data[field] || 'Not provided')}</td></tr>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#0f172a"><div style="background:#07111f;color:#fff;padding:28px"><strong style="font-size:20px">AEGZA AI</strong><p style="color:#68e8e1;margin-bottom:0">New Website Inquiry</p></div><div style="padding:28px 0"><table style="width:100%;border-collapse:collapse">${rows}<tr><td style="padding:8px 0;color:#64748b">Submitted</td><td style="padding:8px 0;color:#0f172a">${timestamp}</td></tr></table></div></div>`;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({ from: process.env.FROM_EMAIL, to: process.env.CONTACT_EMAIL, replyTo: data.email, subject: `New Aegza Website Inquiry — ${data.company || data.fullName}`, html, headers: { 'X-Aegza-Submission-ID': submissionId } });
    if (result.error) throw new Error(result.error.message);
    if (process.env.ENABLE_AUTO_REPLY === 'true') await resend.emails.send({ from: process.env.FROM_EMAIL, to: data.email, subject: 'We received your inquiry — Aegza AI', text: `Hi ${data.fullName},\n\nThank you for reaching out to Aegza.\n\nWe have received your inquiry and will review the details. A member of our team will get back to you shortly.\n\nBest regards,\nAegza AI\nHuman Intelligence. Built for AI.` });
    processedSubmissions.set(submissionId, Date.now());
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Aegza contact email failed', error);
    return response.status(502).json({ error: 'Email delivery failed' });
  }
};
