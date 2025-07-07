// Script to run the sample data generator
import dotenv from 'dotenv';

dotenv.config();
import('./generate-sample-analytics.js')
  .then(() => {
    console.log('Sample data generator completed');
  })
  .catch(error => {
    console.error('Error running sample data generator:', error);
  });
