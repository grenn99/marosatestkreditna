// Main function to handle POST requests
function doPost(e) {
  try {
    Logger.log("doPost function called at: " + new Date().toISOString());

    // Parse the JSON data from the request
    let data;
    try {
      data = JSON.parse(e.postData.contents);
      Logger.log("Successfully parsed data: " + JSON.stringify(data));
    } catch (parseError) {
      Logger.log("Error parsing JSON: " + parseError.toString());
      return ContentService.createTextOutput(JSON.stringify({
        result: 'error',
        message: 'Invalid JSON: ' + parseError.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Determine the type of email to send based on the data
    if (data.isConfirmation) {
      // Handle newsletter confirmation email
      return handleNewsletterConfirmation(data);
    } else if (data.isWelcome) {
      // Handle welcome email with discount code
      return handleWelcomeEmail(data);
    } else {
      // Default to order confirmation email
      return handleOrderConfirmation(data);
    }

  } catch (error) {
    Logger.log("Critical error in doPost: " + error.toString());
    Logger.log("Stack trace: " + error.stack);

    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: 'Critical error: ' + error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle newsletter confirmation emails
 */
function handleNewsletterConfirmation(data) {
  try {
    Logger.log("Processing newsletter confirmation email");

    // Extract data
    const to = data.to || '';
    const subject = data.subject || 'Potrditev prijave na e-novice Kmetije Maroša';
    const from = data.from || 'kmetija.marosa.narocila@gmail.com';
    const replyTo = data.replyTo || 'kmetija.marosa.narocila@gmail.com';

    // Parse the body to get HTML and text content
    let htmlContent = '';
    let textContent = '';

    // Check if data.body exists and is an object
    if (data.body && typeof data.body === 'object') {
      htmlContent = data.body.html || '';
      textContent = data.body.text || '';
      if (data.body.isConfirmation) {
        Logger.log("Newsletter confirmation body successfully processed from object.");
      }
    } else if (typeof data.body === 'string') {
      // Fallback for stringified JSON, though not expected from current Edge Function
      try {
        const bodyData = JSON.parse(data.body);
        htmlContent = bodyData.html || '';
        textContent = bodyData.text || '';
        Logger.log("Newsletter confirmation body successfully processed from parsed string.");
      } catch (parseError) {
        Logger.log("Error parsing string email body for newsletter: " + parseError.toString());
        htmlContent = data.body; // Use as is if parsing fails
        textContent = data.body;
      }
    } else {
      Logger.log("Warning: data.body for newsletter is not an object or string, or is missing. Body received: " + JSON.stringify(data.body));
      // Set to empty or default if body is not in expected format
      htmlContent = '';
      textContent = '';
    }

    // CRITICAL: Block sending to marosa@noexpire.top
    const blockedEmail = 'marosa@noexpire.top';

    // Validate required fields
    if (!to) {
      Logger.log("Missing required field: to (email recipient)");
      return ContentService.createTextOutput(JSON.stringify({
        result: 'error',
        message: 'Missing required field: to (email recipient)'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Send email with explicit error handling
    let emailSent = false;
    try {
      // Skip sending to blocked email
      if (to !== blockedEmail) {
        Logger.log("Sending confirmation email to: " + to);
        Logger.log("Using reply-to address: " + replyTo);

        GmailApp.sendEmail(
          to,
          subject,
          textContent, // Plain text body
          {
            htmlBody: htmlContent,
            replyTo: replyTo,
            name: 'Kmetija Maroša'
          }
        );
        emailSent = true;
        Logger.log("Confirmation email sent successfully to: " + to);
      } else {
        Logger.log("Skipping sending to blocked email: " + to);
        emailSent = true; // Mark as sent to avoid errors
      }
    } catch (emailError) {
      Logger.log("Error sending confirmation email: " + emailError.toString());
    }

    // Return response
    return ContentService.createTextOutput(JSON.stringify({
      result: emailSent ? 'success' : 'error',
      message: emailSent ? 'Confirmation email sent successfully' : 'Failed to send confirmation email',
      to: to,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in handleNewsletterConfirmation: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: 'Error processing confirmation email: ' + error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle welcome emails with discount codes
 */
function handleWelcomeEmail(data) {
  try {
    Logger.log("Processing welcome email");

    // Extract data
    const to = data.to || '';
    const subject = data.subject || 'Dobrodošli na Kmetiji Maroša - Vaša koda za popust!';
    const from = data.from || 'kmetija.marosa.narocila@gmail.com';
    const replyTo = data.replyTo || 'kmetija.marosa.narocila@gmail.com';

    // Log if discount code is present at top level
    if (data.discountCode) {
      Logger.log("Discount code found at top level: " + data.discountCode);
    }

    // Parse the body to get HTML and text content
    let htmlContent = '';
    let textContent = '';
    let discountCode = data.discountCode; // Get discount code from top level first

    // Check if data.body exists and is an object
    if (data.body && typeof data.body === 'object') {
      htmlContent = data.body.html || '';
      textContent = data.body.text || '';

      // If discount code is not at top level, try to get it from body
      if (!discountCode && data.body.discountCode) {
        discountCode = data.body.discountCode;
        Logger.log("Discount code found in body: " + discountCode);
      }
    } else if (typeof data.body === 'string') {
      // Fallback for stringified JSON
      try {
        const bodyData = JSON.parse(data.body);
        htmlContent = bodyData.html || '';
        textContent = bodyData.text || '';

        // If discount code is not at top level, try to get it from parsed body
        if (!discountCode && bodyData.discountCode) {
          discountCode = bodyData.discountCode;
          Logger.log("Discount code found in parsed string body: " + discountCode);
        }
      } catch (parseError) {
        Logger.log("Error parsing string email body for welcome: " + parseError.toString());
        htmlContent = data.body; // Use as is if parsing fails
        textContent = data.body;
      }
    } else {
      Logger.log("Warning: data.body for welcome is not an object or string, or is missing");
      htmlContent = '';
      textContent = '';
    }

    // Log discount code status
    if (discountCode) {
      Logger.log("Using discount code in welcome email: " + discountCode);
    } else {
      Logger.log("No discount code found for welcome email");
    }

    // CRITICAL: Skip sending to blocked email
    const blockedEmail = 'marosa@noexpire.top';

    // Send email with explicit error handling
    let emailSent = false;
    try {
      // Skip sending to blocked email
      if (to !== blockedEmail) {
        Logger.log("Sending welcome email to: " + to);
        Logger.log("Using reply-to address: " + replyTo);

        GmailApp.sendEmail(
          to,
          subject,
          textContent, // Plain text body
          {
            htmlBody: htmlContent,
            replyTo: replyTo,
            name: 'Kmetija Maroša'
          }
        );
        emailSent = true;
        Logger.log("Welcome email sent successfully to: " + to);
      } else {
        Logger.log("Skipping sending to blocked email: " + to);
        emailSent = true; // Mark as sent to avoid errors
      }
    } catch (emailError) {
      Logger.log("Error sending welcome email: " + emailError.toString());
    }

    // Return response
    return ContentService.createTextOutput(JSON.stringify({
      result: emailSent ? 'success' : 'error',
      message: emailSent ? 'Welcome email sent successfully' : 'Failed to send welcome email',
      to: to,
      discountCode: discountCode, // Include discount code in response for debugging
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in handleWelcomeEmail: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: 'Error processing welcome email: ' + error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle order confirmation emails
 */
function handleOrderConfirmation(data) {
  try {
    Logger.log("Processing order confirmation email");

    // Extract order data with validation
    const orderId = data.orderId || 'Unknown';
    const customerName = data.customerName || 'Customer';
    const customerEmail = data.customerEmail || '';
    const adminEmail = data.adminEmail || 'kmetija.marosa.narocila@gmail.com';
    const orderTotal = data.orderTotal || '0.00';
    const paymentMethod = data.paymentMethod || 'unknown';
    const orderItems = data.orderItems || [];
    const shippingAddress = data.shippingAddress || {};
    const orderDate = data.orderDate || new Date().toISOString();

    // Get the reply-to email from the data or use the default
    const replyToEmail = data.replyToEmail || 'kmetija.marosa@gmail.com';

    // CRITICAL: Block sending to marosa@noexpire.top
    const blockedEmail = 'marosa@noexpire.top';

    // Validate required fields
    if (!customerEmail) {
      Logger.log("Missing required field: customerEmail");
      return ContentService.createTextOutput(JSON.stringify({
        result: 'error',
        message: 'Missing required field: customerEmail'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Log the extracted data
    Logger.log("Processing order: " + orderId + " for customer: " + customerName + " (" + customerEmail + ")");
    Logger.log("Admin email: " + adminEmail);
    Logger.log("Reply-to email: " + replyToEmail);

    // Format date
    const formattedDate = new Date(orderDate).toLocaleDateString('sl-SI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Generate email subject
    const subject = `Kmetija Maroša - Potrditev naročila #${orderId}`;

    // Generate email body based on payment method
    let emailBody = `Spoštovani ${customerName},<br><br>`;
    emailBody += `Zahvaljujemo se vam za vaše naročilo. Spodaj so podrobnosti vašega naročila:<br><br>`;
    emailBody += `<strong>Številka naročila:</strong> ${orderId}<br>`;
    emailBody += `<strong>Datum naročila:</strong> ${formattedDate}<br>`;
    emailBody += `<strong>Skupni znesek:</strong> ${orderTotal} €<br><br>`;

    // Add shipping address
    emailBody += `<strong>Naslov za dostavo:</strong><br>`;
    emailBody += `${shippingAddress.name || customerName}<br>`;
    emailBody += `${shippingAddress.address || ''}<br>`;
    emailBody += `${shippingAddress.postalCode || ''} ${shippingAddress.city || ''}<br>`;
    emailBody += `${shippingAddress.country || ''}<br>`;
    emailBody += `Tel: ${shippingAddress.phone || ''}<br><br>`;

    // Add order items
    emailBody += `<strong>Naročeni izdelki:</strong><br>`;
    emailBody += `<table border="1" cellpadding="5" style="border-collapse: collapse;">`;
    emailBody += `<tr><th>Izdelek</th><th>Pakiranje</th><th>Količina</th><th>Cena</th><th>Skupaj</th></tr>`;

    orderItems.forEach(item => {
      emailBody += `<tr>`;
      emailBody += `<td>${item.product_name || ''}</td>`;
      emailBody += `<td>${item.package_description || ''}</td>`;
      emailBody += `<td>${item.quantity || ''}</td>`;
      emailBody += `<td>${item.price_per_unit ? item.price_per_unit.toFixed(2) + ' €' : ''}</td>`;
      emailBody += `<td>${item.line_total ? item.line_total.toFixed(2) + ' €' : ''}</td>`;
      emailBody += `</tr>`;
    });

    emailBody += `</table><br>`;

    // Add payment-specific information
    if (paymentMethod === 'bank_transfer' || paymentMethod === 'Bank Transfer') {
      emailBody += `<strong>Podatki za bančno nakazilo:</strong><br>`;
      emailBody += `IBAN: SI56 0700 0000 4161 875<br>`;
      emailBody += `Imetnik računa: Kmetija Maroša<br>`;
      emailBody += `Banka: Gorenjska Banka d.d., Kranj<br>`;
      emailBody += `Sklic: ${orderId}<br>`;
      emailBody += `Znesek: ${orderTotal} €<br><br>`;
      emailBody += `Prosimo, vključite številko naročila v sklic plačila. Vaše naročilo bo obdelano, ko bo plačilo prejeto.<br><br>`;
    } else if (paymentMethod === 'pay_on_delivery' || paymentMethod === 'Pay on Delivery') {
      emailBody += `<strong>Plačilo po povzetju:</strong><br>`;
      emailBody += `Prosimo, pripravite točen znesek ob dostavi.<br><br>`;
    } else if (paymentMethod === 'credit_card' || paymentMethod === 'Credit Card') {
      emailBody += `<strong>Plačilo s kreditno kartico:</strong><br>`;
      emailBody += `Vaše plačilo je bilo uspešno obdelano. Hvala za vaš nakup!<br><br>`;
    }

    // Add footer
    emailBody += `Če imate kakršna koli vprašanja glede vašega naročila, nas lahko kontaktirate na kmetija.marosa@gmail.com ali 031 627 364.<br><br>`;
    emailBody += `Hvala za vaše naročilo!<br><br>`;
    emailBody += `Lep pozdrav,<br>`;
    emailBody += `Ekipa Kmetije Maroša`;

    // Send email to customer with explicit error handling
    let customerEmailSent = false;
    try {
      // CRITICAL: Skip sending to blocked email
      if (customerEmail !== blockedEmail) {
        Logger.log("Attempting to send customer email to: " + customerEmail);
        Logger.log("Using reply-to address: " + replyToEmail);

        GmailApp.sendEmail(
          customerEmail,
          subject,
          '', // Plain text body
          {
            htmlBody: emailBody,
            replyTo: replyToEmail, // Use the replyToEmail parameter
            name: 'Kmetija Maroša'
          }
        );
        customerEmailSent = true;
        Logger.log("Customer email sent successfully to: " + customerEmail);
      } else {
        Logger.log("Skipping sending to blocked email: " + customerEmail);
        customerEmailSent = true; // Mark as sent to avoid errors
      }
    } catch (customerEmailError) {
      Logger.log("Error sending customer email: " + customerEmailError.toString());
    }

    // Send email to admin with explicit error handling
    let adminEmailSent = false;
    try {
      // CRITICAL: Skip sending to blocked email
      if (adminEmail !== blockedEmail) {
        Logger.log("Attempting to send admin email to: " + adminEmail);
        Logger.log("Using reply-to address: " + replyToEmail);

        GmailApp.sendEmail(
          adminEmail,
          `Novo naročilo #${orderId}`,
          '', // Plain text body
          {
            htmlBody: `Novo naročilo je bilo prejeto:<br><br>${emailBody}`,
            replyTo: replyToEmail, // Use the replyToEmail parameter
            name: 'Kmetija Maroša - Sistem za naročila'
          }
        );
        adminEmailSent = true;
        Logger.log("Admin email sent successfully to: " + adminEmail);
      } else {
        Logger.log("Skipping sending to blocked email: " + adminEmail);
        adminEmailSent = true; // Mark as sent to avoid errors
      }
    } catch (adminEmailError) {
      Logger.log("Error sending admin email: " + adminEmailError.toString());
    }

    // Return detailed response
    return ContentService.createTextOutput(JSON.stringify({
      result: customerEmailSent || adminEmailSent ? 'success' : 'error',
      message: `Email sending status: Customer=${customerEmailSent}, Admin=${adminEmailSent}`,
      customerEmail: customerEmail,
      adminEmail: adminEmail,
      replyToEmail: replyToEmail,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in handleOrderConfirmation: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: 'Error processing order confirmation email: ' + error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
