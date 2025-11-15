import sendEmail from '../utils/sendEmail.js';

// POST /api/contact
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide name, email, subject and message.' });
    }

    const to = process.env.CONTACT_EMAIL || 'ayojola75@gmail.com';
    const fullSubject = `[Website Contact] ${subject}`;
    const html = `
      <h2>New contact message from website</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr/>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    await sendEmail({ to, subject: fullSubject, html, text: message });
    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error sending contact message:', err);
    res.status(500).json({ message: 'Failed to send message', detail: err.message });
  }
};
