import nodemailer from 'nodemailer';

export async function sendOrderApprovalEmail(
  toEmail: string,
  sellerName: string,
  orderNumber: string,
  totalAmount: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Order Approved!</h2>
        <p style="color: #334155; line-height: 1.6;">
          Hello <strong>${sellerName}</strong>,
        </p>
        <p style="color: #334155; line-height: 1.6;">
          Great news! Your order <strong>#${orderNumber}</strong> has been officially approved by AasaMedChem.
        </p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #475569; font-size: 14px;">Total Approved Value:</p>
          <p style="margin: 5px 0 0; color: #0f172a; font-size: 24px; font-weight: bold;">${totalAmount}</p>
        </div>
        <p style="color: #334155; line-height: 1.6;">
          The inventory has been successfully secured for you. You can view the full details in your Seller Dashboard.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          This is an automated notification from the AasaMedChem Marketplace.
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"AasaMedChem Admin" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Order Approved: #${orderNumber}`,
      html: htmlContent,
    });

    console.log(`Email sent successfully to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending order approval email:', error);
    return false; // Don't throw to prevent crashing the main transaction
  }
}

export async function sendQuotationApprovalEmail(
  toEmail: string,
  sellerName: string,
  quotationNumber: string,
  totalAmount: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Quotation Approved!</h2>
        <p style="color: #334155; line-height: 1.6;">
          Hello <strong>${sellerName}</strong>,
        </p>
        <p style="color: #334155; line-height: 1.6;">
          Your recent quotation <strong>#${quotationNumber}</strong> has been officially approved by the AasaMedChem team.
        </p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #475569; font-size: 14px;">Approved Quotation Value:</p>
          <p style="margin: 5px 0 0; color: #0f172a; font-size: 24px; font-weight: bold;">${totalAmount}</p>
        </div>
        <p style="color: #334155; line-height: 1.6;">
          You can now proceed to your Seller Dashboard to convert this quotation into a formal order.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          This is an automated notification from the AasaMedChem Marketplace.
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"AasaMedChem Admin" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Quotation Approved: #${quotationNumber}`,
      html: htmlContent,
    });

    console.log(`Quotation Email sent successfully to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending quotation approval email:', error);
    return false;
  }
}
