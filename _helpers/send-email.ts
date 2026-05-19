
    // RESEND VERSION
    
     export default async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM || 'info@my-node-api.com' }: any) {
         
         
         const authorizedEmail = 'anclineseaborg68@gmail.com'; 
         const modifiedHtml = `<p><strong>Note:</strong> This message was intended for: ${to}</p><hr>${html}`;
    
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
             },
                body: JSON.stringify({
                    from: 'onboarding@resend.dev', 
                    to: authorizedEmail, // Always send to your authorized address
                    subject: `[TEST] ${subject}`,
                    html: modifiedHtml,
                }),
            });
   
            if (!response.ok) {
                const error = await response.text();
                console.error('Resend Error:', error);
            } else {
                console.log(`Success! Email for ${to} was redirected to ${authorizedEmail}`);
            }
        } catch (err) {
            console.error('Network error:', err);
        }
    }

   