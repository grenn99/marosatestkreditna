# Gift Recipient Address Feature

## Overview

The Gift Recipient Address feature allows customers to specify a different delivery address for gift items in their order. This enables customers to send gifts directly to friends or family members while having regular items delivered to their own address.

## Implementation Details

### Database Structure

The gift recipient address information is currently stored in the order notes field as a structured JSON string. This approach was chosen to avoid modifying the database schema while still providing the functionality.

In the future, we may consider adding dedicated columns to the `orders` table for gift recipient address information.

### Components

1. **GiftRecipientAddressForm**
   - A new React component that displays a form for entering gift recipient address information
   - Only appears when there are gift items in the cart
   - Allows users to toggle whether they want to use a different address for gift items
   - Provides fields for recipient name, address, city, postal code, and country
   - Includes postal code suggestions for common cities in Slovenia

2. **AdminOrdersPage Updates**
   - Enhanced to display gift recipient address information in the order details
   - Extracts and formats the gift recipient address from the order notes
   - Visually distinguishes gift recipient address from regular shipping address

3. **OrderSuccessPage Updates**
   - Shows gift recipient address information in the order confirmation page
   - Provides clear visual indication that the gift will be sent to a different address

### Data Flow

1. User adds gift items to cart (either through gift options or gift product selection)
2. At checkout, the GiftRecipientAddressForm appears
3. User can toggle whether to use a different address for gift items
4. If enabled, user enters recipient address details
5. On order submission, the recipient address is stored in the order notes as a structured JSON string
6. Admin panel and order confirmation page extract and display this information

## Usage

### For Customers

1. Add gift items to your cart
2. Proceed to checkout
3. If you have gift items in your cart, you'll see the "Gift Delivery Address" section
4. Check the "Send gift to a different address" option
5. Enter the recipient's address details
6. Complete the checkout process

### For Administrators

1. In the Admin Orders page, gift orders with a separate delivery address will show a "Gift Recipient Address" section
2. This section displays the recipient's name and address details
3. Use this information when preparing and shipping the gift items

## Future Improvements

1. Add dedicated columns to the `orders` table for gift recipient address information
2. Implement gift wrapping options with customizable messages
3. Allow multiple gift recipients in a single order
4. Add gift tracking and delivery notifications
5. Implement gift receipt options (hide prices, include personalized messages)

## Translation Keys

The following translation keys have been added for this feature:

- `checkout.giftRecipient.title`: "Gift Delivery Address"
- `checkout.giftRecipient.useGiftAddress`: "Send gift to a different address"
- `checkout.giftRecipient.description`: "If you want to send your gift directly to the recipient, please provide their address."
- `checkout.giftRecipient.recipientDetails`: "Recipient Details"
- `checkout.giftRecipient.name`: "Recipient Name"
- `checkout.giftRecipient.namePlaceholder`: "Full name of the recipient"
- `checkout.giftRecipient.address`: "Address"
- `checkout.giftRecipient.addressPlaceholder`: "Street address"
- `checkout.giftRecipient.postalCode`: "Postal Code"
- `checkout.giftRecipient.postalCodePlaceholder`: "e.g., 1000"
- `checkout.giftRecipient.city`: "City"
- `checkout.giftRecipient.cityPlaceholder`: "e.g., Ljubljana"
- `checkout.giftRecipient.country`: "Country"
- `admin.orderManagement.giftRecipientAddress`: "Gift Recipient Address"
- `admin.orderManagement.giftAddressInNotes`: "Gift recipient address information is included in the order notes below."
- `orders.giftRecipientAddress`: "Gift Recipient Address"
- `orders.giftAddressInNotes`: "Gift recipient address information is included in the order."
