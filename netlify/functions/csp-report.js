// CSP Violation Report Handler
exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    // Parse the CSP violation report
    const report = JSON.parse(event.body);
    
    // Log the violation report
    console.log('CSP Violation Report:');
    console.log(JSON.stringify(report, null, 2));
    
    // Here you could send the report to a monitoring service
    // or store it in a database for later analysis
    
    return {
      statusCode: 204 // No Content (success with no response body)
    };
  } catch (error) {
    console.error('Error processing CSP report:', error);
    
    return {
      statusCode: 400,
      body: 'Bad Request'
    };
  }
};
