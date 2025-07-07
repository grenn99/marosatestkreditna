-- This SQL can be executed in the Supabase SQL Editor to create the invoices table

-- Create invoices table
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

-- Create RLS policies for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view their own invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = invoices.order_id
            AND (
                orders.profile_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = orders.profile_id
                    AND profiles.user_id = auth.uid()
                )
            )
        )
    );

-- Only admins can insert/update/delete invoices
CREATE POLICY "Admins can manage all invoices" ON public.invoices
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS invoices_order_id_idx ON public.invoices(order_id);
