-- Step 1: Create invoices table
-- This script only creates the invoices table without any RLS policies

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
    payment_method TEXT NOT NULL,
    payment_id TEXT,
    invoice_number TEXT,
    invoice_url TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT,
    customer_city TEXT,
    customer_postal_code TEXT,
    customer_country TEXT,
    tax_rate DECIMAL(5, 2) DEFAULT 9.5,
    tax_amount DECIMAL(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS invoices_order_id_idx ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);
CREATE INDEX IF NOT EXISTS invoices_customer_email_idx ON public.invoices(customer_email);

-- Create audit function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to invoices table
DROP TRIGGER IF EXISTS set_timestamp ON public.invoices;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Verify the table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoices'
ORDER BY ordinal_position;
