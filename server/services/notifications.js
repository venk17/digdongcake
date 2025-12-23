import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// UPI Payment Configuration
const UPI_CONFIG = {
  upiId: process.env.UPI_ID || 'your-upi-id@oksbi',
  whatsappNumber: process.env.BUSINESS_PHONE_NUMBER?.replace('whatsapp:', '') || '+917373042268',
  contactTime: '10 minutes',
  businessName: 'Ding Dong Cake & Bake'
};

// Admin URL Configuration
const ADMIN_CONFIG = {
  adminUrl: process.env.ADMIN_DASHBOARD_URL || 'https://dingdongcakebake.vercel.app/admin',
  businessName: 'Ding Dong Cake & Bake'
};

// Initialize services conditionally
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const emailTransporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  : null;

/**
 * Extract customer contact information from order object
 */
const extractCustomerInfo = (order) => {
  const customerInfo = {
    name: order.customerInfo?.name || order.customerName || 'Customer',
    email: order.customerInfo?.email || order.email,
    mobile: order.customerInfo?.mobile || order.phone || order.mobile,
    address: order.customerInfo?.address || order.deliveryAddress,
    landmark: order.customerInfo?.landmark,
    deliveryInstructions: order.customerInfo?.deliveryInstructions,
    deliveryType: order.customerInfo?.deliveryType || 'delivery'
  };

  console.log('📞 Extracted customer info:', customerInfo);
  return customerInfo;
};

/**
 * Format mobile number for WhatsApp
 */
const formatMobileForWhatsApp = (mobile) => {
  if (!mobile) return null;
  
  // Remove non-digit characters
  const cleanMobile = mobile.replace(/\D/g, '');
  
  // If number doesn't start with country code, add India code (91)
  if (cleanMobile.length === 10) {
    return `91${cleanMobile}`;
  }
  
  return cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`;
};

/**
 * Generate customer WhatsApp message
 */
const generateCustomerWhatsAppMessage = (order, customerInfo) => {
  const totalAmount = order.total?.toFixed(2) || order.totalAmount;
  
  return `Thank you for your order from ${UPI_CONFIG.businessName}! 🍰

Order ID: ${order._id || order.orderId}
Customer: ${customerInfo.name}
Total: ₹${totalAmount}

⏰ We will contact you within ${UPI_CONFIG.contactTime}

💳 *UPI Payment Details:*
UPI ID: ${UPI_CONFIG.upiId}

📱 *WhatsApp Support:* ${UPI_CONFIG.whatsappNumber}

If you want to pay via UPI, send payment to the UPI ID above and share the payment screenshot on WhatsApp.

We'll contact you soon with delivery details!`;
};

/**
 * Send WhatsApp to customer
 */
const sendWhatsAppToCustomer = async (order, customerInfo) => {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio not configured');
  }

  const formattedMobile = formatMobileForWhatsApp(customerInfo.mobile);
  if (!formattedMobile) {
    throw new Error('No valid mobile number provided');
  }

  const messageBody = generateCustomerWhatsAppMessage(order, customerInfo);

  console.log('📱 Sending WhatsApp to customer:', `whatsapp:+${formattedMobile}`);

  try {
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `whatsapp:+${formattedMobile}`
    });
    
    console.log('✅ WhatsApp sent. SID:', message.sid);
    return message.sid;
  } catch (error) {
    console.error('❌ WhatsApp failed:', error.message);
    throw error;
  }
};

/**
 * Generate customer email HTML
 */
const generateCustomerEmailHTML = (order, customerInfo) => {
  const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
  const totalAmount = order.total?.toFixed(2) || order.totalAmount;
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
      .header { background: linear-gradient(135deg, #d97706, #f59e0b); color: white; padding: 30px; text-align: center; }
      .content { background: white; padding: 30px; }
      .order-item { border-bottom: 1px solid #eee; padding: 15px 0; }
      .total { background: #f8f9fa; padding: 20px; margin: 20px 0; font-size: 18px; font-weight: bold; border-radius: 8px; }
      .payment-section { background: #fef3c7; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; }
      .upi-details { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border: 2px solid #d97706; }
      .contact-info { background: #ecfdf5; padding: 20px; margin: 15px 0; border-radius: 8px; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f3f4f6; }
      .qr-code { max-width: 200px; margin: 15px auto; display: block; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🍰 ${UPI_CONFIG.businessName}</h1>
        <h2>Order Confirmed!</h2>
      </div>
      
      <div class="content">
        <h3>Hi ${customerInfo.name},</h3>
        <p>Thank you for your order! We're excited to prepare your delicious treats.</p>
        
        <div class="contact-info">
          <h4 style="margin-top: 0; color: #065f46;">⏰ We will contact you within ${UPI_CONFIG.contactTime}</h4>
        </div>
        
        <h4>Order Details:</h4>
        <p><strong>Order ID:</strong> ${order._id || order.orderId}</p>
        <p><strong>Order Date:</strong> ${orderDate.toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
        
        <h4>Items Ordered:</h4>
        ${(order.items || []).map(item => `
          <div class="order-item">
            <strong>${item.name}</strong><br>
            Quantity: ${item.quantity} × ₹${item.price} = ₹${(item.price * item.quantity).toFixed(2)}
          </div>
        `).join('')}
        
        <div class="total">
          Total Amount: ₹${totalAmount}
        </div>
        
        <div class="payment-section">
          <h4>💳 Prefer Online Payment?</h4>
          <div class="upi-details">
            <h5 style="margin-top: 0; color: #d97706;">UPI Payment Details</h5>
            <p style="font-size: 18px; font-weight: bold; color: #1f2937;">UPI ID: ${UPI_CONFIG.upiId}</p>
            <img src="cid:upiQr" alt="UPI QR Code" class="qr-code">
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
              If you want to pay via UPI, send payment to this UPI ID and share the payment screenshot on WhatsApp.
            </p>
          </div>
          
          <div style="margin-top: 20px;">
            <h5 style="margin-bottom: 10px;">📱 WhatsApp Support</h5>
            <p style="font-weight: bold; color: #1f2937;">${UPI_CONFIG.whatsappNumber}</p>
            <p style="color: #6b7280; font-size: 14px;">
              Send payment screenshot to this number for instant confirmation
            </p>
          </div>
        </div>
        
        <h4>${customerInfo.deliveryType === 'self-pickup' ? 'Pickup Information' : 'Delivery Information'}:</h4>
        <p><strong>Name:</strong> ${customerInfo.name}</p>
        <p><strong>Mobile:</strong> ${customerInfo.mobile}</p>
        ${customerInfo.address ? `<p><strong>Address:</strong> ${customerInfo.address}</p>` : ''}
        ${customerInfo.landmark ? `<p><strong>Landmark:</strong> ${customerInfo.landmark}</p>` : ''}
        ${customerInfo.deliveryInstructions ? `<p><strong>Instructions:</strong> ${customerInfo.deliveryInstructions}</p>` : ''}
        
        <p style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
          Thank you for choosing ${UPI_CONFIG.businessName}! 🎂<br>
          We'll contact you shortly with order updates.
        </p>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${UPI_CONFIG.businessName}. All rights reserved.</p>
        <p>Need help? Contact us at ${UPI_CONFIG.whatsappNumber}</p>
      </div>
    </div>
  </body>
  </html>`;
};

/**
 * Send email to customer
 */
const sendEmailToCustomer = async (order, customerInfo) => {
  if (!emailTransporter) {
    throw new Error('Email transporter not configured');
  }

  console.log('📧 Preparing customer email to:', customerInfo.email);

  const attachments = [];

  // Attach UPI QR if available
  const upiQrPath = path.join(process.cwd(), 'assets', 'upi.png');
  if (fs.existsSync(upiQrPath)) {
    attachments.push({
      filename: 'upi.png',
      path: upiQrPath,
      cid: 'upiQr'
    });
  }

  // Attach logo if available
  const logoPath = path.join(process.cwd(), 'assets', 'logo.png');
  if (fs.existsSync(logoPath)) {
    attachments.push({
      filename: 'logo.png',
      path: logoPath,
      cid: 'logoImage'
    });
  }

  const emailHTML = generateCustomerEmailHTML(order, customerInfo);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerInfo.email,
    subject: `Order Confirmed – We'll contact you within ${UPI_CONFIG.contactTime} – ${UPI_CONFIG.businessName}`,
    html: emailHTML,
    attachments
  };

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Customer email sent. Message ID:', info.messageId);
    return info.messageId;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    throw error;
  }
};

/**
 * Generate business WhatsApp message
 */
const generateBusinessWhatsAppMessage = (order, customerInfo) => {
  const orderType = customerInfo.deliveryType === 'self-pickup' ? 'Self Pickup' : 'Delivery';
  const totalAmount = order.total?.toFixed(2) || order.totalAmount;
  
  let message = `🚨 NEW ${orderType.toUpperCase()} ORDER RECEIVED!\n\n`;

  message += `Order ID: ${order._id || order.orderId}\n`;
  message += `Customer: ${customerInfo.name}\n`;
  message += `Mobile: ${customerInfo.mobile}\n`;
  message += `Total: ₹${totalAmount}\n`;
  message += `Payment: ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}\n\n`;

  message += `Items Ordered:\n`;
  (order.items || []).forEach((item, index) => {
    message += `${index + 1}. ${item.name} - ${item.quantity}x - ₹${item.price * item.quantity}\n`;
  });

  message += `\n${customerInfo.deliveryType === 'self-pickup' ? '🛵 Self Pickup Order' : '🚚 Delivery Order'}\n`;

  if (customerInfo.address) {
    message += `\nDelivery Address:\n${customerInfo.address}\n`;
    if (customerInfo.landmark) {
      message += `Landmark: ${customerInfo.landmark}\n`;
    }
  } else {
    message += `\n📍 Self Pickup\n`;
  }

  // ✅ ADDED YOUR ADMIN URL HERE
  message += `\n📊 View order details: ${ADMIN_CONFIG.adminUrl}`;

  return message;
};

/**
 * Send business WhatsApp notification
 */
const sendBusinessWhatsAppNotification = async (order, customerInfo) => {
  if (!twilioClient || !process.env.BUSINESS_PHONE_NUMBER) {
    throw new Error('Business WhatsApp not configured');
  }

  const messageBody = generateBusinessWhatsAppMessage(order, customerInfo);

  console.log('🏪 Sending business WhatsApp to:', process.env.BUSINESS_PHONE_NUMBER);

  try {
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.BUSINESS_PHONE_NUMBER
    });

    console.log('✅ Business WhatsApp sent. SID:', message.sid);
    return message.sid;
  } catch (error) {
    console.error('❌ Business WhatsApp failed:', error.message);
    throw error;
  }
};

/**
 * Generate business email HTML
 */
const generateBusinessEmailHTML = (order, customerInfo) => {
  const orderType = customerInfo.deliveryType === 'self-pickup' ? 'Self Pickup' : 'Delivery';
  const totalAmount = order.total?.toFixed(2) || order.totalAmount;
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; text-align: center; }
      .content { background: #f8f9fa; padding: 25px; }
      .order-item { border-bottom: 1px solid #ddd; padding: 10px 0; }
      .total { background: white; padding: 15px; margin: 15px 0; font-size: 18px; font-weight: bold; border: 2px solid #dc2626; }
      .customer-info { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #d97706; }
      .delivery-type { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      .delivery { background: #dbeafe; color: #1e40af; }
      .pickup { background: #fef3c7; color: #d97706; }
      .admin-btn { 
        display: inline-block; 
        background: #d97706; 
        color: white; 
        padding: 10px 20px; 
        text-decoration: none; 
        border-radius: 5px; 
        font-weight: bold;
        margin: 10px 5px;
      }
      .admin-btn:hover { background: #b45309; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🚨 NEW ${orderType.toUpperCase()} ORDER</h1>
        <h2>${ADMIN_CONFIG.businessName}</h2>
      </div>
      
      <div class="content">
        <div class="customer-info">
          <h3>Customer Information</h3>
          <p><strong>Order ID:</strong> ${order._id || order.orderId}</p>
          <p><strong>Customer Name:</strong> ${customerInfo.name}</p>
          <p><strong>Mobile:</strong> ${customerInfo.mobile}</p>
          <p><strong>Email:</strong> ${customerInfo.email || 'Not provided'}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</p>
          <p><strong>Service Type:</strong> 
            <span class="delivery-type ${customerInfo.deliveryType === 'self-pickup' ? 'pickup' : 'delivery'}">
              ${customerInfo.deliveryType === 'self-pickup' ? '🛵 SELF PICKUP' : '🚚 DELIVERY'}
            </span>
          </p>
        </div>

        <h3>Order Items</h3>
        ${(order.items || []).map(item => `
          <div class="order-item">
            <strong>${item.name}</strong><br>
            Quantity: ${item.quantity} × ₹${item.price} = ₹${(item.price * item.quantity).toFixed(2)}
          </div>
        `).join('')}
        
        <div class="total">
          Total Amount: ₹${totalAmount}
        </div>

        ${customerInfo.address ? `
        <div class="customer-info">
          <h3>${customerInfo.deliveryType === 'self-pickup' ? 'Pickup Information' : 'Delivery Address'}</h3>
          <p>${customerInfo.address}</p>
          ${customerInfo.landmark ? `<p><strong>Landmark:</strong> ${customerInfo.landmark}</p>` : ''}
          ${customerInfo.deliveryInstructions ? `<p><strong>Delivery Instructions:</strong> ${customerInfo.deliveryInstructions}</p>` : ''}
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
          <h3>Quick Actions</h3>
          <p>
            <a href="${ADMIN_CONFIG.adminUrl}" class="admin-btn" target="_blank">
              📊 View in Admin Dashboard
            </a>
          </p>
          <p style="font-size: 14px; color: #666; margin-top: 15px;">
            Direct link: <a href="${ADMIN_CONFIG.adminUrl}" target="_blank">${ADMIN_CONFIG.adminUrl}</a>
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>`;
};

/**
 * Send business email notification
 */
const sendBusinessEmailNotification = async (order, customerInfo) => {
  if (!emailTransporter || !process.env.BUSINESS_EMAIL) {
    throw new Error('Business email not configured');
  }

  console.log('🏪 Sending business email to:', process.env.BUSINESS_EMAIL);

  const emailHTML = generateBusinessEmailHTML(order, customerInfo);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.BUSINESS_EMAIL,
    subject: `🚨 New ${customerInfo.deliveryType === 'self-pickup' ? 'Self Pickup' : 'Delivery'} Order - ${order._id || order.orderId} - ${ADMIN_CONFIG.businessName}`,
    html: emailHTML
  };

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Business email sent. Message ID:', info.messageId);
    return info.messageId;
  } catch (error) {
    console.error('❌ Business email failed:', error.message);
    throw error;
  }
};

/**
 * Main function that handles all order notifications
 */
export const sendOrderNotifications = async (order) => {
  const notifications = {
    whatsappSent: false,
    emailSent: false,
    businessWhatsappSent: false,
    businessEmailSent: false
  };

  try {
    console.log('🔍 Processing order notifications:', order._id || order.orderId);
    
    // Extract customer info
    const customerInfo = extractCustomerInfo(order);

    // Customer notifications
    if (customerInfo.mobile && twilioClient) {
      try {
        await sendWhatsAppToCustomer(order, customerInfo);
        notifications.whatsappSent = true;
      } catch (error) {
        console.warn('⚠️ Customer WhatsApp skipped:', error.message);
      }
    }

    if (customerInfo.email && emailTransporter) {
      try {
        await sendEmailToCustomer(order, customerInfo);
        notifications.emailSent = true;
      } catch (error) {
        console.warn('⚠️ Customer email skipped:', error.message);
      }
    }

    // Business notifications
    if (process.env.BUSINESS_PHONE_NUMBER && twilioClient) {
      try {
        await sendBusinessWhatsAppNotification(order, customerInfo);
        notifications.businessWhatsappSent = true;
      } catch (error) {
        console.warn('⚠️ Business WhatsApp skipped:', error.message);
      }
    }

    if (process.env.BUSINESS_EMAIL && emailTransporter) {
      try {
        await sendBusinessEmailNotification(order, customerInfo);
        notifications.businessEmailSent = true;
      } catch (error) {
        console.warn('⚠️ Business email skipped:', error.message);
      }
    }

    console.log('📊 Notification summary:', notifications);
    return notifications;

  } catch (error) {
    console.error('💥 Notification process error:', error);
    return notifications;
  }
};

export default sendOrderNotifications;