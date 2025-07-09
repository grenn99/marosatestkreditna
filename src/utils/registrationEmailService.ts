import { sendEmail } from './emailService';
import { generateRegistrationConfirmationEmailHtml, generateRegistrationConfirmationEmailText } from '../templates/registrationConfirmationEmail';

const DEFAULT_FROM_EMAIL = 'marc999933@gmail.com';
const REPLY_TO_EMAIL = 'kmetija.marosa@gmail.com';
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://marosakreditna.netlify.app' 
  : 'http://localhost:5174';

/**
 * Generate a secure token for email confirmation
 */
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Send registration confirmation email using the same email service as newsletter
 * @param data Object containing email, fullName, and userId
 * @returns Object with success status and message
 */
export async function sendRegistrationConfirmationEmail(data: {
  email: string;
  fullName?: string;
  userId: string;
  language?: string;
}): Promise<{ success: boolean; message: string; confirmationToken?: string }> {
  try {
    const { email, fullName, userId, language = 'sl' } = data;

    // Generate confirmation token
    const confirmationToken = generateSecureToken();

    // Store the confirmation token in a custom table (we'll create this)
    // For now, we'll use the confirmation token as a URL parameter
    const confirmationParams = new URLSearchParams({ 
      token: confirmationToken, 
      userId: userId,
      lang: language 
    });
    const confirmationUrl = `${BASE_URL}/auth/confirm-registration?${confirmationParams}`;

    // Generate email content
    const htmlContent = generateRegistrationConfirmationEmailHtml({
      fullName,
      confirmationUrl,
      language
    });

    const textContent = generateRegistrationConfirmationEmailText({
      fullName,
      confirmationUrl,
      language
    });

    // Determine subject based on language
    const subject = (() => {
      if (language === 'sl') return 'Potrdite svoj račun - Kmetija Maroša';
      if (language === 'en') return 'Confirm Your Account - Kmetija Maroša';
      if (language === 'de') return 'Bestätigen Sie Ihr Konto - Kmetija Maroša';
      if (language === 'hr') return 'Potvrdite svoj račun - Kmetija Maroša';
      return 'Confirm Your Account - Kmetija Maroša';
    })();

    try {
      // Send the email using the same service as newsletter
      const emailResult = await sendEmail({
        to: email,
        subject,
        body: JSON.stringify({
          html: htmlContent,
          text: textContent,
          isRegistrationConfirmation: true,
          confirmationToken,
          userId
        }),
        from: DEFAULT_FROM_EMAIL,
        replyTo: REPLY_TO_EMAIL
      });

      if (emailResult.success) {
        return {
          success: true,
          message: 'Registration confirmation email sent successfully',
          confirmationToken
        };
      } else {
        throw new Error(emailResult.message);
      }
    } catch (emailError: any) {
      console.error('Error in email sending service:', emailError);

      // For development/testing, return success even if email fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating successful email send');
        console.log('Confirmation URL would be:', confirmationUrl);
        return {
          success: true,
          message: 'Development mode: Email would be sent in production',
          confirmationToken
        };
      }

      throw emailError;
    }
  } catch (error: any) {
    console.error('Error sending registration confirmation email:', error);
    return {
      success: false,
      message: error.message || 'Failed to send confirmation email'
    };
  }
}
