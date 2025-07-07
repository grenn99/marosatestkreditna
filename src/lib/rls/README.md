# Step-by-Step RLS Implementation Guide

This folder contains scripts to implement Row Level Security (RLS) in your Supabase database in a careful, step-by-step manner. Each script performs a specific task and includes verification steps to ensure everything is working correctly.

## Implementation Order

Follow these steps in order, testing your application after each step:

1. **Create Invoices Table** (`step1_create_invoices.sql`)
   - Creates the invoices table structure
   - Adds indexes and triggers
   - Does not enable RLS yet

2. **Create Backup Tables** (`step2_create_backups.sql`)
   - Creates backup copies of all existing tables
   - Verifies that backups contain the same number of rows

3. **Add Required Columns** (`step3_add_columns.sql`)
   - Adds columns needed for RLS policies
   - Adds `created_by` and `isActive` to products
   - Adds `is_admin` and `is_active` to profiles
   - Adds `created_by` to profiles_guest

4. **Enable RLS on Products** (`step4_enable_rls_products.sql`)
   - Enables RLS only on the products table
   - Creates policies for public access, user access, and admin access
   - Verifies that policies are created

5. **Enable RLS on Orders** (`step5_enable_rls_orders.sql`)
   - Enables RLS on the orders table
   - Creates policies for user and admin access
   - Verifies that policies are created

6. **Enable RLS on Profiles** (`step6_enable_rls_profiles.sql`)
   - Enables RLS on the profiles table
   - Creates policies for user and admin access
   - Verifies that policies are created

7. **Enable RLS on Profiles_Guest** (`step7_enable_rls_profiles_guest.sql`)
   - Enables RLS on the profiles_guest table
   - Creates policies for guest checkout
   - Verifies that policies are created

8. **Enable RLS on Invoices** (`step8_enable_rls_invoices.sql`)
   - Enables RLS on the invoices table
   - Creates policies for user and admin access
   - Verifies that policies are created

9. **Verify All RLS Policies** (`step9_verify_all_rls.sql`)
   - Checks that all tables have RLS enabled
   - Lists all policies for verification

## Testing After Each Step

After running each script, test your application to ensure it still works correctly:

1. **Test as Anonymous User**
   - Can view active products
   - Cannot view inactive products
   - Cannot access admin functions

2. **Test as Regular User**
   - Can view active products
   - Can view their own orders
   - Can create new orders
   - Cannot access admin functions

3. **Test as Admin User**
   - Can view all products (active and inactive)
   - Can create, update, and delete products
   - Can view all orders
   - Can update order statuses

## Rollback Instructions

If you encounter issues, use the `rollback_rls.sql` script to disable RLS on all tables.

## Important Notes

- Always run scripts in the SQL Editor in the Supabase dashboard
- Each script includes verification steps to check that it ran correctly
- Each script includes rollback instructions in case of issues
- Test thoroughly after each step before proceeding to the next
