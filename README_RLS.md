# Row Level Security (RLS) Implementation for Kmetija Marosa

This document explains the Row Level Security (RLS) implementation for the Kmetija Marosa e-commerce application.

## Overview

Row Level Security (RLS) is a PostgreSQL feature that allows you to control which rows in a table a user can access. We've implemented RLS policies for all tables in the database to ensure proper data security.

## Files Included

1. `src/lib/database_setup.sql` - Complete SQL script to create the invoices table and apply RLS policies to all tables
2. `src/lib/RLS_IMPLEMENTATION_GUIDE.md` - Step-by-step guide on how to implement RLS in Supabase
3. `src/lib/supabaseClient.ts` - Updated client with proper admin access control
4. `src/pages/AdminProductsPage.tsx` - Updated admin page with async admin status checking

## Implementation Steps

### 1. Create the Invoices Table and Apply RLS Policies

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `src/lib/database_setup.sql`
4. Paste it into the SQL Editor and run it

This will:
- Create the invoices table
- Add necessary columns to existing tables
- Enable RLS on all tables
- Create appropriate RLS policies for each table

### 2. Verify the Implementation

After running the script, you should see output showing:
- Tables with RLS enabled
- Policies applied to each table

### 3. Test the Application

1. Run the application with `npm run dev`
2. Test as an anonymous user (not logged in)
3. Test as a regular user
4. Test as an admin user

## Security Model

### Products Table

- **Public access:** Anyone can view active products
- **User access:** Users can view products they created
- **Admin access:** Admins can create, update, and delete products

### Orders Table

- **User access:** Users can view and create their own orders
- **Admin access:** Admins can view all orders and update order statuses
- **No deletion:** Orders cannot be deleted (for audit purposes)

### Profiles Table

- **User access:** Users can view and update their own profile
- **Admin access:** Admins can view and update all profiles
- **No deletion:** Profiles cannot be deleted (use is_active flag instead)

### Profiles_Guest Table

- **User access:** Users can view guest profiles they created
- **Public access:** Anyone can create guest profiles (for guest checkout)
- **Admin access:** Admins can view all guest profiles

### Invoices Table

- **User access:** Users can view invoices for their own orders
- **Admin access:** Admins can view, create, and update all invoices
- **No deletion:** Invoices cannot be deleted (for audit purposes)

## Code Changes

### supabaseClient.ts

- Updated `isUserAdmin` function to be async and check both hardcoded list and database
- Added `isUserAdminSync` for immediate checks when needed
- Updated `performAdminOperation` to properly await admin status check

### AdminProductsPage.tsx

- Added state to track admin status
- Added useEffect to check admin status when user changes
- Updated confirmDeleteProduct to double-check admin status before proceeding

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that RLS policies are correctly applied in Supabase
3. Make sure the necessary columns exist in your tables
4. Check that admin users have the is_admin flag set to true in the profiles table

## Next Steps

After implementing RLS, consider:

1. Adding more granular policies as your application evolves
2. Setting up monitoring for unauthorized access attempts
3. Implementing regular security audits
4. Adding more comprehensive error handling throughout the application
