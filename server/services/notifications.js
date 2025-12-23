import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ============================================
// CONFIGURATION - Based on your .env file
// ============================================
const CONFIG = {
  // UPI Payment Details from .env
  UPI_ID: process.env.UPI_ID || 'hanihanisha95-2@okicici',
  UPI_QR_PATH: process.env.UPI_QR_PATH || 'http://localhost:5173/assets/logo.png',
  LOGO_PATH: process.env.LOGO_PATH || 'http://localhost:5173/assets/logo.png',
  BUSINESS_NAME: 'Ding Dong Cake & Bake',
  CONTACT_TIME: process.env.CONTACT_TIME || '10 minutes',
  
  // Store Information from .env
  STORE_ADDRESS: process.env.STORE_ADDRESS || '123 Cake Street, Sweet City, SC 12345',
  STORE_HOURS: process.env.STORE_HOURS || '9:00 AM - 9:00 PM (Daily)',
  
  // Contact Information from .env
  BUSINESS_WHATSAPP: process.env.BUSINESS_PHONE_NUMBER || 'whatsapp:+917373042268',
  BUSINESS_EMAIL: process.env.BUSINESS_EMAIL || 'dingdongcakebake@gmail.com',
  SUPPORT_EMAIL: process.env.BUSINESS_EMAIL || 'dingdongcakebake@gmail.com',
  
  // Admin Configuration from .env
  ADMIN_URL: process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5173/admin',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  
  // Service Configuration from .env
  TWILIO_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE: process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886',
  
  // Email Configuration from .env
  EMAIL_USER: process.env.EMAIL_USER || 'dingdongcakebake@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'nmyr nprj syar tinc',
  
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Debug Mode
  DEBUG_MODE: process.env.NODE_ENV !== 'production'
};

// ============================================
// SERVICE INITIALIZATION
// ============================================
console.log('🔧 Initializing notification services...');
console.log('🏪 Business:', CONFIG.BUSINESS_NAME);
console.log('📱 Twilio Configured:', !!CONFIG.TWILIO_SID);
console.log('📧 Email Configured:', !!CONFIG.EMAIL_USER);

let twilioClient = null;
let emailTransporter = null;

// Initialize Twilio
if (CONFIG.TWILIO_SID && CONFIG.TWILIO_TOKEN) {
  try {
    twilioClient = twilio(CONFIG.TWILIO_SID, CONFIG.TWILIO_TOKEN);
    console.log('✅ Twilio initialized successfully');
  } catch (error) {
    console.error('❌ Twilio initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Twilio credentials missing');
}

// Initialize Email
if (CONFIG.EMAIL_USER && CONFIG.EMAIL_PASS) {
  try {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: CONFIG.EMAIL_USER,
        pass: CONFIG.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify email connection
    emailTransporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error);
      } else {
        console.log('✅ Email transporter ready');
      }
    });
  } catch (error) {
    console.error('❌ Email initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Email credentials missing');
}

// Check for UPI QR code
const checkUPIQRCode = () => {
  try {
    // Try multiple possible locations
    const possiblePaths = [
      path.join(__dirname, '../assets/upi-qr.png'),
      path.join(__dirname, '../assets/logo.png'),
      path.join(__dirname, '../assets/upi.png'),
      path.join(__dirname, '../public/assets/upi-qr.png'),
      path.join(__dirname, '../public/assets/logo.png'),
      path.join(__dirname, '../public/assets/upi.png')
    ];
    
    for (const qrPath of possiblePaths) {
      if (fs.existsSync(qrPath)) {
        console.log('✅ Found UPI QR/Logo at:', qrPath);
        return qrPath;
      }
    }
    
    console.warn('⚠️ UPI QR/Logo not found in common locations');
    return null;
  } catch (error) {
    console.error('❌ Error checking UPI QR code:', error.message);
    return null;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract and validate customer information
 */
export const extractCustomerInfo = (order) => {
  console.log('🔍 Extracting customer info from order:', order._id || order.orderId);
  
  const customerInfo = {
    name: 'Customer',
    email: '',
    mobile: '',
    address: '',
    landmark: '',
    deliveryInstructions: '',
    deliveryType: 'delivery'
  };
  
  // Check multiple possible locations for customer info
  if (order.customerInfo) {
    Object.assign(customerInfo, {
      name: order.customerInfo.name || customerInfo.name,
      email: order.customerInfo.email || order.customerInfo.emailAddress || '',
      mobile: order.customerInfo.mobile || order.customerInfo.phone || order.customerInfo.phoneNumber || '',
      address: order.customerInfo.address || order.customerInfo.deliveryAddress || '',
      landmark: order.customerInfo.landmark || '',
      deliveryInstructions: order.customerInfo.deliveryInstructions || order.customerInfo.instructions || '',
      deliveryType: order.customerInfo.deliveryType || order.customerInfo.deliveryOption || 'delivery'
    });
  }
  
  // Fallback to root level fields
  if (!customerInfo.name || customerInfo.name === 'Customer') {
    customerInfo.name = order.customerName || order.name || 'Customer';
  }
  
  if (!customerInfo.email) {
    customerInfo.email = order.email || order.customerEmail || '';
  }
  
  if (!customerInfo.mobile) {
    customerInfo.mobile = order.phone || order.mobile || order.phoneNumber || '';
  }
  
  if (!customerInfo.address) {
    customerInfo.address = order.deliveryAddress || order.address || order.shippingAddress || '';
  }
  
  if (!customerInfo.deliveryType) {
    customerInfo.deliveryType = order.deliveryType || (order.pickup ? 'self-pickup' : 'delivery');
  }
  
  // Clean mobile number
  if (customerInfo.mobile) {
    customerInfo.mobile = customerInfo.mobile.toString().replace(/\s+/g, '');
  }
  
  console.log('📱 Extracted Customer Info:', {
    name: customerInfo.name,
    mobile: customerInfo.mobile,
    email: customerInfo.email ? 'Present' : 'Missing',
    deliveryType: customerInfo.deliveryType
  });
  
  return customerInfo;
};

/**
 * Format mobile number for WhatsApp
 */
const formatMobileForWhatsApp = (mobile) => {
  if (!mobile) {
    console.warn('📱 No mobile number provided');
    return null;
  }
  
  // Convert to string and clean
  let cleanMobile = mobile.toString().trim();
  
  // Remove all non-digit characters except +
  cleanMobile = cleanMobile.replace(/[^\d+]/g, '');
  
  // Check if it starts with +91 or 91
  if (cleanMobile.startsWith('+91')) {
    return cleanMobile.substring(1); // Remove + for Twilio
  } else if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
    return cleanMobile; // Already has 91 prefix
  } else if (cleanMobile.length === 10) {
    return '91' + cleanMobile; // Add India code
  } else if (cleanMobile.startsWith('0')) {
    return '91' + cleanMobile.substring(1); // Remove leading 0 and add 91
  }
  
  console.warn('📱 Unrecognized mobile format:', cleanMobile);
  return cleanMobile;
};

/**
 * Validate email address
 */
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================
// CUSTOMER NOTIFICATIONS
// ============================================

/**
 * Generate WhatsApp message for customer
 */
const generateCustomerWhatsAppMessage = (order, customerInfo) => {
  const orderId = order._id || order.orderId || 'N/A';
  const totalAmount = order.totalAmount || order.total || order.grandTotal || 0;
  
  return `Thank you for your order from ${CONFIG.BUSINESS_NAME}! 🎂

📦 *Order Details:*
Order ID: ${orderId}
Customer: ${customerInfo.name}
Total Amount: ₹${totalAmount}

⏰ We will contact you within ${CONFIG.CONTACT_TIME} to confirm your order.

💳 *UPI Payment Option:*
If you prefer online payment, you can pay using:
UPI ID: ${CONFIG.UPI_ID}

📱 *WhatsApp Support:* ${CONFIG.BUSINESS_WHATSAPP.replace('whatsapp:', '')}

After payment, please share the screenshot with us on WhatsApp for confirmation.

Thank you for choosing ${CONFIG.BUSINESS_NAME}! We'll contact you soon with delivery details.`;
};

/**
 * Send WhatsApp to customer
 */
const sendWhatsAppToCustomer = async (order, customerInfo) => {
  if (!twilioClient) {
    console.error('❌ WhatsApp: Twilio client not initialized');
    return null;
  }
  
  const formattedMobile = formatMobileForWhatsApp(customerInfo.mobile);
  if (!formattedMobile) {
    console.error('❌ WhatsApp: Invalid mobile number:', customerInfo.mobile);
    return null;
  }
  
  const messageBody = generateCustomerWhatsAppMessage(order, customerInfo);
  
  console.log('📱 Sending WhatsApp to customer:', `whatsapp:+${formattedMobile}`);
  
  try {
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: CONFIG.TWILIO_PHONE,
      to: `whatsapp:+${formattedMobile}`
    });
    
    console.log('✅ WhatsApp sent successfully. SID:', message.sid);
    return message.sid;
  } catch (error) {
    console.error('❌ WhatsApp sending failed:', {
      error: error.message,
      code: error.code,
      mobile: formattedMobile,
      twilioPhone: CONFIG.TWILIO_PHONE
    });
    return null;
  }
};

/**
 * Generate email HTML for customer
 */
const generateCustomerEmailHTML = (order, customerInfo) => {
  const orderId = order._id || order.orderId || 'N/A';
  const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
  const totalAmount = order.totalAmount || order.total || order.grandTotal || 0;
  
  // Check for UPI QR code
  let qrCodeHTML = '';
  const qrCodePath = checkUPIQRCode();
  if (qrCodePath) {
    qrCodeHTML = `
    <div style="text-align: center; margin: 20px 0;">
      <h3>Scan to Pay</h3>
      <img src="cid:upiQr" alt="UPI QR Code" style="width: 200px; height: 200px; border: 1px solid #ddd; border-radius: 10px;">
    </div>`;
  }
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${CONFIG.BUSINESS_NAME}</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 30px;
      }
      .order-info {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #ff6b6b;
      }
      .order-details {
        margin: 20px 0;
      }
      .order-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }
      .total {
        background: #ff6b6b;
        color: white;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        margin: 20px 0;
      }
      .payment-info {
        background: #fff3cd;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #ffeaa7;
        margin: 20px 0;
      }
      .contact-info {
        background: #e3f2fd;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .store-info {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        border-left: 4px solid #28a745;
      }
      .button {
        display: inline-block;
        background: #ff6b6b;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        margin: 10px 5px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #666;
        font-size: 14px;
        background: #f8f9fa;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎂 ${CONFIG.BUSINESS_NAME}</h1>
        <h2>Order Confirmation</h2>
      </div>
      
      <div class="content">
        <h3>Dear ${customerInfo.name},</h3>
        <p>Thank you for your order! We've received it and will contact you within <strong>${CONFIG.CONTACT_TIME}</strong> to confirm the details.</p>
        
        <div class="order-info">
          <h4>📦 Order Summary</h4>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Order Date:</strong> ${orderDate.toLocaleDateString()}</p>
          <p><strong>Delivery Type:</strong> ${customerInfo.deliveryType === 'self-pickup' ? 'Self Pickup' : 'Home Delivery'}</p>
        </div>
        
        <div class="order-details">
          <h4>🛒 Items Ordered</h4>
          ${(order.items || []).map(item => `
            <div class="order-item">
              <span>${item.name} × ${item.quantity}</span>
              <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="total">
          Total Amount: ₹${totalAmount.toFixed(2)}
        </div>
        
        <div class="payment-info">
          <h4>💳 Online Payment Option</h4>
          <p>If you prefer to pay online, you can use:</p>
          <div style="text-align: center; padding: 15px; background: white; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #ff6b6b; margin: 10px 0;">UPI ID: ${CONFIG.UPI_ID}</h3>
            ${qrCodeHTML}
          </div>
          <p><strong>Note:</strong> After payment, please share the screenshot on WhatsApp for confirmation.</p>
        </div>
        
        ${customerInfo.deliveryType === 'self-pickup' ? `
        <div class="store-info">
          <h4>🏪 Store Information for Pickup</h4>
          <p><strong>Address:</strong> ${CONFIG.STORE_ADDRESS}</p>
          <p><strong>Store Hours:</strong> ${CONFIG.STORE_HOURS}</p>
          <p>Please bring your order ID when picking up your order.</p>
        </div>
        ` : ''}
        
        <div class="contact-info">
          <h4>📞 Contact Us</h4>
          <p><strong>WhatsApp:</strong> ${CONFIG.BUSINESS_WHATSAPP.replace('whatsapp:', '')}</p>
          <p><strong>Email:</strong> ${CONFIG.SUPPORT_EMAIL}</p>
          <p>We'll contact you shortly with delivery updates!</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://wa.me/${CONFIG.BUSINESS_WHATSAPP.replace('whatsapp:', '')}" class="button" target="_blank">
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${CONFIG.BUSINESS_NAME}. All rights reserved.</p>
        <p>${CONFIG.STORE_ADDRESS} | Open: ${CONFIG.STORE_HOURS}</p>
        <p>This is an automated email. Please do not reply directly.</p>
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
    console.error('❌ Email: Transporter not initialized');
    return null;
  }
  
  if (!isValidEmail(customerInfo.email)) {
    console.error('❌ Email: Invalid email address:', customerInfo.email);
    return null;
  }
  
  console.log('📧 Preparing email for:', customerInfo.email);
  
  const emailHTML = generateCustomerEmailHTML(order, customerInfo);
  
  // Prepare attachments
  const attachments = [];
  
  // Add UPI QR code if exists
  const qrCodePath = checkUPIQRCode();
  if (qrCodePath) {
    attachments.push({
      filename: 'upi-qr.png',
      path: qrCodePath,
      cid: 'upiQr'
    });
  }
  
  const mailOptions = {
    from: `"${CONFIG.BUSINESS_NAME}" <${CONFIG.EMAIL_USER}>`,
    to: customerInfo.email,
    subject: `Order Confirmation #${order._id || order.orderId} - ${CONFIG.BUSINESS_NAME}`,
    html: emailHTML,
    attachments
  };
  
  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully. Message ID:', info.messageId);
    return info.messageId;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return null;
  }
};

// ============================================
// BUSINESS NOTIFICATIONS
// ============================================

/**
 * Generate business WhatsApp message
 */
const generateBusinessWhatsAppMessage = (order, customerInfo) => {
  const orderId = order._id || order.orderId || 'N/A';
  const totalAmount = order.totalAmount || order.total || order.grandTotal || 0;
  const orderType = customerInfo.deliveryType === 'self-pickup' ? 'SELF PICKUP' : 'DELIVERY';
  
  let message = `🚨 *NEW ORDER - ${orderType}* 🚨\n\n`;
  
  message += `📋 *Order Details:*\n`;
  message += `Order ID: ${orderId}\n`;
  message += `Customer: ${customerInfo.name}\n`;
  message += `Mobile: ${customerInfo.mobile}\n`;
  message += `Total: ₹${totalAmount}\n`;
  message += `Payment: ${order.paymentMethod === 'COD' ? '💰 Cash on Delivery' : '💳 Online'}\n\n`;
  
  message += `🛒 *Items:*\n`;
  (order.items || []).forEach((item, index) => {
    message += `${index + 1}. ${item.name} - ${item.quantity}x = ₹${item.price * item.quantity}\n`;
  });
  
  message += `\n📍 *${customerInfo.deliveryType === 'self-pickup' ? 'PICKUP DETAILS' : 'DELIVERY ADDRESS'}*\n`;
  
  if (customerInfo.deliveryType === 'self-pickup') {
    message += `Customer will pickup from store\n`;
    message += `Store: ${CONFIG.STORE_ADDRESS}\n`;
  } else {
    message += `${customerInfo.address || 'Address not provided'}\n`;
    if (customerInfo.landmark) {
      message += `Landmark: ${customerInfo.landmark}\n`;
    }
  }
  
  if (customerInfo.deliveryInstructions) {
    message += `\n📝 Instructions: ${customerInfo.deliveryInstructions}\n`;
  }
  
  message += `\n📊 *Admin Dashboard:*\n`;
  message += `${CONFIG.ADMIN_URL}\n`;
  message += `Login: ${CONFIG.ADMIN_USERNAME}\n`;
  
  return message;
};

/**
 * Send business WhatsApp notification
 */
const sendBusinessWhatsAppNotification = async (order, customerInfo) => {
  if (!twilioClient) {
    console.error('❌ Business WhatsApp: Twilio not initialized');
    return null;
  }
  
  if (!CONFIG.BUSINESS_WHATSAPP) {
    console.error('❌ Business WhatsApp: No business number configured');
    return null;
  }
  
  console.log('🏪 Sending business WhatsApp to:', CONFIG.BUSINESS_WHATSAPP);
  
  const messageBody = generateBusinessWhatsAppMessage(order, customerInfo);
  
  try {
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: CONFIG.TWILIO_PHONE,
      to: CONFIG.BUSINESS_WHATSAPP
    });
    
    console.log('✅ Business WhatsApp sent. SID:', message.sid);
    return message.sid;
  } catch (error) {
    console.error('❌ Business WhatsApp failed:', {
      error: error.message,
      code: error.code
    });
    return null;
  }
};

/**
 * Generate business email HTML
 */
const generateBusinessEmailHTML = (order, customerInfo) => {
  const orderId = order._id || order.orderId || 'N/A';
  const totalAmount = order.totalAmount || order.total || order.grandTotal || 0;
  const orderType = customerInfo.deliveryType === 'self-pickup' ? 'Self Pickup' : 'Home Delivery';
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString();
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 700px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #dc3545, #ff6b6b); color: white; padding: 25px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; }
      .header h2 { margin: 5px 0 0 0; font-size: 18px; opacity: 0.9; }
      .content { padding: 25px; }
      .alert-badge { background: #dc3545; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; margin-bottom: 15px; }
      .order-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
      .order-items { margin: 20px 0; }
      .order-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
      .total-section { background: #ff6b6b; color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 22px; font-weight: bold; margin: 20px 0; }
      .customer-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .delivery-info { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .admin-link { text-align: center; margin-top: 30px; }
      .button { background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-top: 1px solid #eee; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${CONFIG.BUSINESS_NAME}</h1>
        <h2>New Order Notification</h2>
      </div>
      
      <div class="content">
        <div class="alert-badge">🚨 NEW ${orderType.toUpperCase()} ORDER</div>
        
        <div class="order-summary">
          <h3>Order Summary</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Order Type:</strong> ${orderType}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
        </div>
        
        <div class="customer-info">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${customerInfo.name}</p>
          <p><strong>Mobile:</strong> ${customerInfo.mobile}</p>
          <p><strong>Email:</strong> ${customerInfo.email || 'Not provided'}</p>
        </div>
        
        <h3>Order Items</h3>
        <div class="order-items">
          ${(order.items || []).map(item => `
            <div class="order-item">
              <div>
                <strong>${item.name}</strong><br>
                <small>Quantity: ${item.quantity}</small>
              </div>
              <div style="text-align: right;">
                <div>₹${item.price} × ${item.quantity}</div>
                <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="total-section">
          Total Amount: ₹${totalAmount.toFixed(2)}
        </div>
        
        <div class="delivery-info">
          <h3>${customerInfo.deliveryType === 'self-pickup' ? 'Pickup Information' : 'Delivery Information'}</h3>
          ${customerInfo.deliveryType === 'self-pickup' ? `
            <p><strong>Pickup Type:</strong> Self Pickup</p>
            <p><strong>Store Address:</strong> ${CONFIG.STORE_ADDRESS}</p>
            <p><strong>Store Hours:</strong> ${CONFIG.STORE_HOURS}</p>
          ` : `
            <p><strong>Delivery Address:</strong> ${customerInfo.address || 'Not provided'}</p>
            ${customerInfo.landmark ? `<p><strong>Landmark:</strong> ${customerInfo.landmark}</p>` : ''}
          `}
          ${customerInfo.deliveryInstructions ? `<p><strong>Special Instructions:</strong> ${customerInfo.deliveryInstructions}</p>` : ''}
        </div>
        
        <div class="admin-link">
          <a href="${CONFIG.ADMIN_URL}" class="button" target="_blank">
            📊 View Order in Admin Dashboard
          </a>
          <p style="margin-top: 10px; font-size: 12px; color: #666;">
            Admin Login: ${CONFIG.ADMIN_USERNAME}
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${CONFIG.BUSINESS_NAME}. All rights reserved.</p>
        <p>This is an automated notification. Please check the admin dashboard for order details.</p>
      </div>
    </div>
  </body>
  </html>`;
};

/**
 * Send business email notification
 */
const sendBusinessEmailNotification = async (order, customerInfo) => {
  if (!emailTransporter) {
    console.error('❌ Business Email: Transporter not initialized');
    return null;
  }
  
  if (!CONFIG.BUSINESS_EMAIL || !isValidEmail(CONFIG.BUSINESS_EMAIL)) {
    console.error('❌ Business Email: Invalid business email');
    return null;
  }
  
  console.log('🏪 Sending business email to:', CONFIG.BUSINESS_EMAIL);
  
  const emailHTML = generateBusinessEmailHTML(order, customerInfo);
  
  const mailOptions = {
    from: `"${CONFIG.BUSINESS_NAME} Order Notifications" <${CONFIG.EMAIL_USER}>`,
    to: CONFIG.BUSINESS_EMAIL,
    subject: `🚨 New ${customerInfo.deliveryType === 'self-pickup' ? 'Self Pickup' : 'Delivery'} Order #${order._id || order.orderId}`,
    html: emailHTML
  };
  
  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Business email sent. Message ID:', info.messageId);
    return info.messageId;
  } catch (error) {
    console.error('❌ Business email failed:', error.message);
    return null;
  }
};

// ============================================
// MAIN NOTIFICATION FUNCTION
// ============================================

export const sendOrderNotifications = async (order) => {
  console.log('\n🎯 STARTING NOTIFICATIONS FOR ORDER:', order._id || order.orderId);
  console.log('📱 Business WhatsApp:', CONFIG.BUSINESS_WHATSAPP);
  console.log('📧 Business Email:', CONFIG.BUSINESS_EMAIL);
  
  const results = {
    whatsappSent: false,
    whatsappSid: null,
    emailSent: false,
    emailId: null,
    businessWhatsappSent: false,
    businessWhatsappSid: null,
    businessEmailSent: false,
    businessEmailId: null,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Extract customer information
    const customerInfo = extractCustomerInfo(order);
    
    // ========== CUSTOMER NOTIFICATIONS ==========
    
    // Send WhatsApp to customer
    if (customerInfo.mobile && twilioClient) {
      console.log('\n📱 Attempting customer WhatsApp...');
      const whatsappResult = await sendWhatsAppToCustomer(order, customerInfo);
      if (whatsappResult) {
        results.whatsappSent = true;
        results.whatsappSid = whatsappResult;
      }
    } else {
      console.log('⏭️ Skipping customer WhatsApp - no mobile or twilio');
    }
    
    // Send email to customer
    if (customerInfo.email && emailTransporter && isValidEmail(customerInfo.email)) {
      console.log('\n📧 Attempting customer email...');
      const emailResult = await sendEmailToCustomer(order, customerInfo);
      if (emailResult) {
        results.emailSent = true;
        results.emailId = emailResult;
      }
    } else {
      console.log('⏭️ Skipping customer email - no valid email or transporter');
    }
    
    // ========== BUSINESS NOTIFICATIONS ==========
    
    // Send business WhatsApp
    if (CONFIG.BUSINESS_WHATSAPP && twilioClient) {
      console.log('\n🏪 Attempting business WhatsApp...');
      const businessWhatsappResult = await sendBusinessWhatsAppNotification(order, customerInfo);
      if (businessWhatsappResult) {
        results.businessWhatsappSent = true;
        results.businessWhatsappSid = businessWhatsappResult;
      }
    } else {
      console.log('⏭️ Skipping business WhatsApp');
    }
    
    // Send business email
    if (CONFIG.BUSINESS_EMAIL && emailTransporter && isValidEmail(CONFIG.BUSINESS_EMAIL)) {
      console.log('\n🏪 Attempting business email...');
      const businessEmailResult = await sendBusinessEmailNotification(order, customerInfo);
      if (businessEmailResult) {
        results.businessEmailSent = true;
        results.businessEmailId = businessEmailResult;
      }
    } else {
      console.log('⏭️ Skipping business email');
    }
    
    // ========== FINAL SUMMARY ==========
    
    console.log('\n📊 NOTIFICATION SUMMARY:');
    console.log('========================');
    console.log('Customer WhatsApp:', results.whatsappSent ? '✅ Sent' : '❌ Failed');
    console.log('Customer Email:', results.emailSent ? '✅ Sent' : '❌ Failed');
    console.log('Business WhatsApp:', results.businessWhatsappSent ? '✅ Sent' : '❌ Failed');
    console.log('Business Email:', results.businessEmailSent ? '✅ Sent' : '❌ Failed');
    console.log('========================\n');
    
    return results;
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR in sendOrderNotifications:', error);
    return results;
  }
};

// ============================================
// TEST FUNCTION
// ============================================

export const testNotificationSystem = async () => {
  console.log('\n🧪 TESTING NOTIFICATION SYSTEM...\n');
  console.log('🔧 Configuration Loaded:');
  console.log('- UPI ID:', CONFIG.UPI_ID);
  console.log('- Business WhatsApp:', CONFIG.BUSINESS_WHATSAPP);
  console.log('- Business Email:', CONFIG.BUSINESS_EMAIL);
  console.log('- Admin URL:', CONFIG.ADMIN_URL);
  console.log('- Store Address:', CONFIG.STORE_ADDRESS);
  console.log('- Store Hours:', CONFIG.STORE_HOURS);
  
  const testOrder = {
    _id: 'TEST_' + Date.now(),
    orderId: 'TEST_001',
    createdAt: new Date(),
    customerInfo: {
      name: 'Test Customer',
      email: CONFIG.BUSINESS_EMAIL, // Use your business email for testing
      mobile: '7373042268', // Use a test number
      address: '123 Test Street, Test City',
      deliveryType: 'delivery'
    },
    items: [
      { name: 'Chocolate Cake', quantity: 1, price: 500 },
      { name: 'Cupcakes (6 pcs)', quantity: 2, price: 300 }
    ],
    totalAmount: 1100,
    paymentMethod: 'COD'
  };
  
  console.log('\n📄 Test Order Data:');
  console.log(JSON.stringify(testOrder, null, 2));
  
  const results = await sendOrderNotifications(testOrder);
  
  return {
    testCompleted: true,
    results,
    config: {
      twilioReady: !!twilioClient,
      emailReady: !!emailTransporter,
      businessWhatsapp: CONFIG.BUSINESS_WHATSAPP,
      businessEmail: CONFIG.BUSINESS_EMAIL,
      upiId: CONFIG.UPI_ID,
      storeInfo: {
        address: CONFIG.STORE_ADDRESS,
        hours: CONFIG.STORE_HOURS
      }
    }
  };
};

// ============================================
// ADDITIONAL FUNCTIONS
// ============================================

/**
 * Send order status update to customer
 */
export const sendOrderStatusUpdate = async (order, status, message = '') => {
  const customerInfo = extractCustomerInfo(order);
  const orderId = order._id || order.orderId;
  
  if (customerInfo.mobile && twilioClient) {
    const statusMessage = `📦 Order #${orderId} Update\n\n` +
      `Status: ${status}\n` +
      `${message}\n\n` +
      `For any queries, contact us at ${CONFIG.BUSINESS_WHATSAPP.replace('whatsapp:', '')}`;
    
    const formattedMobile = formatMobileForWhatsApp(customerInfo.mobile);
    if (formattedMobile) {
      try {
        const message = await twilioClient.messages.create({
          body: statusMessage,
          from: CONFIG.TWILIO_PHONE,
          to: `whatsapp:+${formattedMobile}`
        });
        console.log('✅ Status update sent. SID:', message.sid);
        return message.sid;
      } catch (error) {
        console.error('❌ Status update failed:', error.message);
        return null;
      }
    }
  }
  return null;
};

/**
 * Send payment reminder
 */
export const sendPaymentReminder = async (order) => {
  const customerInfo = extractCustomerInfo(order);
  const orderId = order._id || order.orderId;
  const totalAmount = order.totalAmount || order.total || order.grandTotal || 0;
  
  if (customerInfo.mobile && twilioClient) {
    const reminderMessage = `💳 Payment Reminder - ${CONFIG.BUSINESS_NAME}\n\n` +
      `Order #${orderId}\n` +
      `Amount: ₹${totalAmount}\n\n` +
      `UPI ID: ${CONFIG.UPI_ID}\n\n` +
      `Please complete your payment and share the screenshot with us.\n` +
      `Contact: ${CONFIG.BUSINESS_WHATSAPP.replace('whatsapp:', '')}`;
    
    const formattedMobile = formatMobileForWhatsApp(customerInfo.mobile);
    if (formattedMobile) {
      try {
        const message = await twilioClient.messages.create({
          body: reminderMessage,
          from: CONFIG.TWILIO_PHONE,
          to: `whatsapp:+${formattedMobile}`
        });
        console.log('✅ Payment reminder sent. SID:', message.sid);
        return message.sid;
      } catch (error) {
        console.error('❌ Payment reminder failed:', error.message);
        return null;
      }
    }
  }
  return null;
};

export default sendOrderNotifications;