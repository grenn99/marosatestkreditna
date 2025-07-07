# Row Level Security (RLS) Implementation Guide

This guide explains how to implement Row Level Security (RLS) in your Supabase database for the Kmetija Marosa application.

## What is Row Level Security?

Row Level Security (RLS) is a feature that allows you to control which rows in a table a user can access. This is essential for multi-tenant applications where users should only see their own data, and for applications with different user roles (like admins and regular users).

## Implementation Steps

### 1. Access the Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Select your project
3. Go to the "SQL Editor" section in the left sidebar
4. Create a new query or open an existing one

### 2. Run the Database Setup Script

1. Copy the contents of the `database_setup.sql` file
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

This script will:
- Create the invoices table
- Add necessary columns to existing tables
- Enable RLS on all tables
- Create appropriate RLS policies for each table
- Set up audit trails with triggers

### 3. Verify the Implementation

After running the script, you should see output showing:
- Tables with RLS enabled
- Policies applied to each table

You can also manually verify by running:

```sql
-- Check tables with RLS enabled
SELECT table_name, has_row_level_security 
FROM information_schema.tables
WHERE table_schema = 'public'
AND has_row_level_security = true;

-- Check policies for each table
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 4. Test the RLS Policies

To ensure your RLS policies are working correctly:

1. **Test as an anonymous user:**
   - Open an incognito browser window
   - Access your application
   - Verify you can only see public products

2. **Test as a regular user:**
   - Log in as a non-admin user
   - Verify you can only see your own orders and profile
   - Verify you can create new orders
   - Verify you cannot access admin functions

3. **Test as an admin:**
   - Log in as an admin user
   - Verify you can see all orders, products, and profiles
   - Verify you can create, update, and delete products
   - Verify you can update order statuses

## Understanding the RLS Policies

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

## Troubleshooting

If you encounter issues with the RLS policies:

1. **Check for syntax errors:** Ensure the SQL script executed without errors
2. **Verify table structure:** Make sure all required columns exist
3. **Test with specific queries:** Use the Supabase SQL Editor to test specific queries
4. **Check authentication:** Ensure users are properly authenticated
5. **Review logs:** Check the Supabase logs for any errors

## Next Steps

After implementing RLS, consider:

1. **Updating your application code:** Ensure your application respects these security boundaries
2. **Adding more granular policies:** Refine policies as your application evolves
3. **Setting up monitoring:** Monitor for unauthorized access attempts
4. **Creating backups:** Regularly backup your database

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
