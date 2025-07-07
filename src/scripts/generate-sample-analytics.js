// Script to generate sample analytics data for testing
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const NUM_SESSIONS = 20;
const EVENTS_PER_SESSION_MIN = 3;
const EVENTS_PER_SESSION_MAX = 15;
const DAYS_BACK = 30;

// Sample data
const pages = [
  { url: '/', label: 'Home Page' },
  { url: '/products', label: 'Products Page' },
  { url: '/about', label: 'About Us' },
  { url: '/contact', label: 'Contact Us' },
  { url: '/blog', label: 'Blog' }
];

const products = [
  { id: 'prod_01', name: 'Organic Apples' },
  { id: 'prod_02', name: 'Fresh Honey' },
  { id: 'prod_03', name: 'Organic Vegetables' },
  { id: 'prod_04', name: 'Farm Eggs' },
  { id: 'prod_05', name: 'Homemade Jam' }
];

const referrers = [
  'https://google.com/search?q=organic+farm',
  'https://facebook.com/share/12345',
  'https://instagram.com/p/12345',
  'https://twitter.com/share?id=12345',
  'https://linkedin.com/share/12345',
  '' // Direct traffic
];

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
];

// Helper functions
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomDate = (daysBack) => {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, daysBack));
  return date;
};

// Generate events for a session
const generateSessionEvents = (sessionId) => {
  const events = [];
  const numEvents = getRandomInt(EVENTS_PER_SESSION_MIN, EVENTS_PER_SESSION_MAX);
  const userAgent = getRandomItem(userAgents);
  const referrer = getRandomItem(referrers);
  const sessionDate = getRandomDate(DAYS_BACK);
  
  // First event is always a page view of the home page
  events.push({
    id: uuidv4(),
    event_type: 'page_view',
    session_id: sessionId,
    url: '/',
    label: 'Home Page',
    referrer: referrer,
    user_agent: userAgent,
    created_at: sessionDate.toISOString()
  });
  
  // Generate additional events
  for (let i = 1; i < numEvents; i++) {
    const eventDate = new Date(sessionDate);
    eventDate.setMinutes(eventDate.getMinutes() + i * getRandomInt(1, 5));
    
    // Determine event type
    let eventType = 'page_view';
    const rand = Math.random();
    
    if (rand < 0.6) {
      // 60% chance of page view
      const page = getRandomItem(pages);
      events.push({
        id: uuidv4(),
        event_type: 'page_view',
        session_id: sessionId,
        url: page.url,
        label: page.label,
        referrer: '',
        user_agent: userAgent,
        created_at: eventDate.toISOString()
      });
    } else if (rand < 0.8) {
      // 20% chance of product view
      const product = getRandomItem(products);
      events.push({
        id: uuidv4(),
        event_type: 'product_view',
        session_id: sessionId,
        url: `/products/${product.id}`,
        label: product.name,
        product_id: product.id,
        referrer: '',
        user_agent: userAgent,
        created_at: eventDate.toISOString()
      });
    } else if (rand < 0.9) {
      // 10% chance of add to cart
      const product = getRandomItem(products);
      events.push({
        id: uuidv4(),
        event_type: 'add_to_cart',
        session_id: sessionId,
        url: `/products/${product.id}`,
        label: `Added ${product.name} to cart`,
        product_id: product.id,
        referrer: '',
        user_agent: userAgent,
        created_at: eventDate.toISOString()
      });
    } else if (rand < 0.95) {
      // 5% chance of checkout
      events.push({
        id: uuidv4(),
        event_type: 'checkout',
        session_id: sessionId,
        url: '/checkout',
        label: 'Checkout',
        referrer: '',
        user_agent: userAgent,
        created_at: eventDate.toISOString()
      });
    } else {
      // 5% chance of purchase
      events.push({
        id: uuidv4(),
        event_type: 'purchase',
        session_id: sessionId,
        url: '/checkout/success',
        label: 'Purchase Complete',
        referrer: '',
        user_agent: userAgent,
        created_at: eventDate.toISOString()
      });
    }
  }
  
  return events;
};

// Main function to generate and insert data
const generateSampleData = async () => {
  console.log('Generating sample analytics data...');
  
  try {
    // Check if analytics_events table exists
    const { error: tableError } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Error: analytics_events table does not exist or is not accessible.');
      console.error('Please run the setup-analytics-tables script first.');
      return;
    }
    
    // Generate sessions and events
    let allEvents = [];
    
    for (let i = 0; i < NUM_SESSIONS; i++) {
      const sessionId = uuidv4();
      const sessionEvents = generateSessionEvents(sessionId);
      allEvents = [...allEvents, ...sessionEvents];
    }
    
    console.log(`Generated ${allEvents.length} events across ${NUM_SESSIONS} sessions.`);
    
    // Insert events in batches to avoid hitting API limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < allEvents.length; i += BATCH_SIZE) {
      const batch = allEvents.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('analytics_events')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
      } else {
        console.log(`Inserted batch ${i / BATCH_SIZE + 1} of ${Math.ceil(allEvents.length / BATCH_SIZE)}`);
      }
    }
    
    console.log('Sample data generation complete!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

// Run the function
generateSampleData();
