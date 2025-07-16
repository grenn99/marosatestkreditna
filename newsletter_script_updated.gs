// Main function to handle POST requests for Newsletter and Welcome emails
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
      // This script only handles newsletter and welcome emails
      Logger.log("Warning: This script only handles newsletter and welcome emails");
      return ContentService.createTextOutput(JSON.stringify({
        result: 'error',
        message: 'This script only handles newsletter and welcome emails. Use isConfirmation=true or isWelcome=true.',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
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
    const from = data.from || 'kmetija.marosa.novice@gmail.com';
    const replyTo = data.replyTo || 'kmetija.marosa.novice@gmail.com';

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
            name: 'Kmetija Maroša - E-novice'
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
    const from = data.from || 'kmetija.marosa.novice@gmail.com';
    const replyTo = data.replyTo || 'kmetija.marosa.novice@gmail.com';

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
            name: 'Kmetija Maroša - E-novice'
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
