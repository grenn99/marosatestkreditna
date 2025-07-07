# Darilo (Gift) Feature Implementation Plan

## Overview
Create a dedicated "Darilo" (Gift) feature that allows users to select products as gifts, customize packaging, add messages, and send to different recipients.

## Database Schema

### 1. Gift Packages Table
```sql
CREATE TABLE gift_packages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    name_de TEXT,
    name_hr TEXT,
    description TEXT,
    description_en TEXT,
    description_de TEXT,
    description_hr TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Gift Recipients Table
```sql
CREATE TABLE gift_recipients (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Slovenija',
    message TEXT,
    gift_package_id INTEGER REFERENCES gift_packages(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Gift Items Table
```sql
CREATE TABLE gift_items (
    id SERIAL PRIMARY KEY,
    gift_recipient_id INTEGER REFERENCES gift_recipients(id),
    product_id INTEGER REFERENCES products(id),
    package_option_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## UI Components

### 1. DariloProductPage
- Landing page for the gift feature
- Displays gift package options
- Allows users to start building a gift

### 2. GiftBuilder
- Interactive component for selecting products to include in a gift
- Shows product categories and allows filtering
- Displays selected products and total cost
- Allows selection of gift packaging

### 3. GiftRecipientForm
- Form for entering recipient information
- Fields for name, address, message, etc.
- Option to add multiple recipients

### 4. GiftCheckoutSummary
- Summary of gift selections during checkout
- Shows recipients, products, and costs

## User Flow

1. **Gift Selection**
   - User navigates to "Darilo" (Gift) product page
   - User selects a gift package option
   - User is taken to the gift builder page

2. **Gift Building**
   - User browses and selects products to include in the gift
   - User can add/remove products and adjust quantities
   - User can preview the gift package

3. **Recipient Information**
   - User enters recipient information
   - User adds a personalized message
   - User can add multiple recipients with different gifts

4. **Checkout**
   - User reviews gift selections in cart
   - User completes checkout process
   - Order is processed with gift information

## Implementation Steps

### Phase 1: Database Setup
1. Create the necessary database tables
2. Set up RLS policies for the new tables
3. Create initial gift package options

### Phase 2: Basic UI Components
1. Create the DariloProductPage component
2. Implement basic gift package selection
3. Create routes for the gift feature

### Phase 3: Gift Builder
1. Implement the GiftBuilder component
2. Add product selection functionality
3. Implement gift package customization

### Phase 4: Recipient Management
1. Create the GiftRecipientForm component
2. Implement multiple recipient support
3. Add gift message functionality

### Phase 5: Checkout Integration
1. Update the cart to handle gifts
2. Modify the checkout process for gifts
3. Update order processing for gifts

### Phase 6: Admin Features
1. Add gift management to admin panel
2. Create reports for gift orders
3. Implement gift status tracking

## Technical Considerations

### State Management
- Use context or Redux for managing gift state
- Handle complex gift configurations

### Performance
- Optimize product loading in the gift builder
- Use pagination for large product catalogs

### Internationalization
- Support multiple languages for gift options
- Translate gift-related messages

### Security
- Validate recipient information
- Secure gift message content

## Testing Plan

1. **Unit Tests**
   - Test gift builder logic
   - Test recipient form validation

2. **Integration Tests**
   - Test gift selection flow
   - Test checkout with gifts

3. **User Testing**
   - Test the complete gift experience
   - Gather feedback on usability
