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
    const replyToEmail = data.replyToEmail || 'kmetija.marosa.narocila@gmail.com';
    
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
    
    // Generate email body with HTML structure and logo
    let emailBody = `
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Potrditev naročila - Kmetija Maroša</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 10px; }
            .logo { max-width: 150px; height: auto; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #8B4513; color: white; }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="https://marosatest.netlify.app/images/logo.png" alt="Kmetija Maroša" class="logo">
            <h1>Potrditev naročila</h1>
        </div>
        
        <div class="content">
            <h2>Spoštovani ${customerName},</h2>
            <p>Zahvaljujemo se vam za vaše naročilo. Spodaj so podrobnosti vašega naročila:</p>
            
            <p><strong>Številka naročila:</strong> ${orderId}<br>
            <strong>Datum naročila:</strong> ${formattedDate}<br>
            <strong>Skupni znesek:</strong> ${orderTotal} €</p>`;
    
    // Add shipping address
    emailBody += `
            <h3>Naslov za dostavo:</h3>
            <p>${shippingAddress.name || customerName}<br>
            ${shippingAddress.address || ''}<br>
            ${shippingAddress.postalCode || ''} ${shippingAddress.city || ''}<br>
            ${shippingAddress.country || ''}<br>
            Tel: ${shippingAddress.phone || ''}</p>`;
    
    // Add order items
    emailBody += `
            <h3>Naročeni izdelki:</h3>
            <table>
                <tr><th>Izdelek</th><th>Pakiranje</th><th>Količina</th><th>Cena</th><th>Skupaj</th></tr>`;
    
    orderItems.forEach(item => {
      emailBody += `<tr>`;
      emailBody += `<td>${item.product_name || ''}</td>`;
      emailBody += `<td>${item.package_description || ''}</td>`;
      emailBody += `<td>${item.quantity || ''}</td>`;
      emailBody += `<td>${item.price_per_unit ? item.price_per_unit.toFixed(2) + ' €' : ''}</td>`;
      emailBody += `<td>${item.line_total ? item.line_total.toFixed(2) + ' €' : ''}</td>`;
      emailBody += `</tr>`;
    });
    
    emailBody += `</table>`;
    
    // Add payment-specific information
    if (paymentMethod === 'bank_transfer' || paymentMethod === 'Bank Transfer' || paymentMethod === 'Neposredno bančno nakazilo') {
      emailBody += `
              <h3>Podatki za bančno nakazilo:</h3>
              <p><strong>IBAN:</strong> SI56 0700 0000 4161 875<br>
              <strong>Imetnik računa:</strong> Kmetija Maroša<br>
              <strong>Banka:</strong> Gorenjska Banka d.d., Kranj<br>
              <strong>Sklic:</strong> ${orderId}<br>
              <strong>Znesek:</strong> ${orderTotal} €</p>
              <p>Prosimo, vključite številko naročila v sklic plačila. Vaše naročilo bo obdelano, ko bo plačilo prejeto.</p>`;
    } else if (paymentMethod === 'pay_on_delivery' || paymentMethod === 'Pay on Delivery' || paymentMethod === 'Plačilo po povzetju') {
      emailBody += `
              <h3>Plačilo po povzetju:</h3>
              <p>Prosimo, pripravite točen znesek ob dostavi.</p>`;
    } else if (paymentMethod === 'credit_card' || paymentMethod === 'Credit Card' || paymentMethod === 'Kreditna kartica (Stripe)') {
      emailBody += `
              <h3>Plačilo s kreditno kartico:</h3>
              <p>Vaše plačilo je bilo uspešno obdelano. Hvala za vaš nakup!</p>`;
    }
    
    // Add footer
    emailBody += `
            <p>Če imate kakršna koli vprašanja glede vašega naročila, nas lahko kontaktirate na kmetija.marosa.narocila@gmail.com ali 031 627 364.</p>
            
            <p>Hvala za vaše naročilo!</p>
            
            <p>Lep pozdrav,<br>
            Ekipa Kmetije Maroša</p>
        </div>
        
        <div class="footer">
            &copy; ${new Date().getFullYear()} Kmetija Maroša. All rights reserved.
        </div>
    </body>
    </html>`;
    
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
            htmlBody: `<h2>Novo naročilo je bilo prejeto:</h2><br>${emailBody}`,
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
