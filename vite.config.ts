import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';

function gmailSmtpPlugin(): Plugin {
  return {
    name: 'gmail-smtp-plugin',
    configureServer(server) {
      server.middlewares.use('/api/send-gmail', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const { to, subject, html, text, appPassword, fromEmail } = payload;
            
            const userEmail = fromEmail || 'devendrs2313@gmail.com';
            const pass = appPassword || process.env.GMAIL_APP_PASSWORD;

            if (!pass) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: false, 
                error: 'Gmail 16-character App Password required to dispatch from devendrs2313@gmail.com via Google SMTP' 
              }));
              return;
            }

            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: userEmail,
                pass: pass.replace(/\s+/g, '')
              }
            });

            const recipients = Array.isArray(to) ? to.join(', ') : to;
            const info = await transporter.sendMail({
              from: `Devendra | PulseMeet <${userEmail}>`,
              to: recipients,
              replyTo: userEmail,
              subject,
              html,
              text: text || subject
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              id: info.messageId,
              recipient: to,
              engine: 'gmail_smtp'
            }));
          } catch (err: any) {
            console.error('[Gmail SMTP Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: err?.message || 'Failed to dispatch via Gmail SMTP'
            }));
          }
        });
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), gmailSmtpPlugin()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api/resend': {
        target: 'https://api.resend.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/resend/, '')
      }
    }
  }
});
