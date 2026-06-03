import nodemailer from 'nodemailer';

export async function sendOrderStatusEmail(
  toEmail: string,
  sellerName: string,
  orderNumber: string,
  totalAmount: string,
  status: string,
  items: any[]
) {
  const allowedStatuses = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'REJECTED'];
  if (!allowedStatuses.includes(status)) return false; // Do not email for minor status updates

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

    let statusTitle = '';
    let statusMessage = '';

    switch (status) {
      case 'ORDER_PLACED':
        statusTitle = 'Order Received';
        statusMessage = 'We have received your order and it is currently Under Review. We will notify you once processing begins.';
        break;
      case 'PROCESSING':
        statusTitle = 'Order Approved & Processing';
        statusMessage = 'Great news! Your order has been approved, inventory has been allocated, and we are currently preparing it for shipment.';
        break;
      case 'SHIPPED':
        statusTitle = 'Order Shipped';
        statusMessage = 'Your order has been dispatched from our facility and is on its way to you.';
        break;
      case 'DELIVERED':
        statusTitle = 'Order Delivered';
        statusMessage = 'Your order has been successfully delivered. Thank you for doing business with AasaMedChem!';
        break;
      case 'REJECTED':
        statusTitle = 'Order Rejected';
        statusMessage = 'Unfortunately, your order could not be processed at this time. Please contact support for more details.';
        break;
    }

    const itemsHtml = items.map((item: any) => 
      `<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">
         <span>${item.product?.name || 'Product'} (${item.orderedQuantity.toString()} ${item.orderedUnit})</span>
       </div>`
    ).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">${statusTitle}</h2>
        <p style="color: #334155; line-height: 1.6;">
          Hello <strong>${sellerName}</strong>,
        </p>
        <p style="color: #334155; line-height: 1.6;">
          ${statusMessage}
        </p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #475569; font-size: 14px;">Order Number:</p>
          <p style="margin: 5px 0 15px; color: #0f172a; font-size: 18px; font-weight: bold;">#${orderNumber}</p>
          
          <p style="margin: 0; color: #475569; font-size: 14px;">Total Value:</p>
          <p style="margin: 5px 0 15px; color: #0f172a; font-size: 24px; font-weight: bold;">${totalAmount}</p>
          
          <p style="margin: 0 0 10px; color: #475569; font-size: 14px;">Items:</p>
          ${itemsHtml}
        </div>
        <p style="color: #334155; line-height: 1.6;">
          You can track your order's real-time timeline from your Seller Dashboard.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          This is an automated notification from the AasaMedChem Marketplace.
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"AasaMedChem Notifications" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Update on Order #${orderNumber}: ${status.replace('_', ' ')}`,
      html: htmlContent,
    });

    console.log(`Email sent successfully to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending order status email:', error);
    return false;
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
