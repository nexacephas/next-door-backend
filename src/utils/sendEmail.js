import nodemailer from 'nodemailer';

const createTransporter = () => {
	const host = process.env.EMAIL_HOST;
	const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
	const user = process.env.EMAIL_USER;
	const pass = process.env.EMAIL_PASS;

	if (host && port && user && pass) {
		return nodemailer.createTransport({
			host,
			port,
			secure: port === 465, // true for 465, false for other ports
			auth: { user, pass },
		});
	}

	// Fallback: direct transport to log to console (not for production)
	return {
		sendMail: async (opts) => {
			console.log('sendEmail fallback - would send:', opts);
			return Promise.resolve({ accepted: [opts.to] });
		},
	};
};

const transporter = createTransporter();

const sendEmail = async ({ to, subject, html, text, from }) => {
	const mailOptions = {
		from: from || process.env.EMAIL_FROM || `no-reply@${process.env.DOMAIN || 'localhost'}`,
		to,
		subject,
		text: text || undefined,
		html: html || undefined,
	};

	const info = await transporter.sendMail(mailOptions);
	return info;
};

export default sendEmail;

