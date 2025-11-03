-- Payment System Database Schema
-- This migration creates all necessary tables for the integrated payment platform

-- Payment Accounts Table
CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  account_type VARCHAR(20) CHECK (account_type IN ('tenant', 'landlord')) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'CAD',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  stripe_account_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, account_type)
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  method_type VARCHAR(20) CHECK (method_type IN ('card', 'bank_account', 'wallet')) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rent Payments Table
CREATE TABLE IF NOT EXISTS rent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) NOT NULL,
  tenant_id UUID REFERENCES auth.users(id) NOT NULL,
  landlord_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CAD',
  due_date DATE NOT NULL,
  paid_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late', 'failed', 'refunded')),
  payment_method_id UUID REFERENCES payment_methods(id),
  transaction_id VARCHAR(255),
  late_fee DECIMAL(10,2) DEFAULT 0.00,
  platform_fee DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES rent_payments(id) NOT NULL,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('payment', 'refund', 'fee', 'transfer')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  provider_transaction_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auto-Pay Configuration Table
CREATE TABLE IF NOT EXISTS auto_pay_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES auth.users(id) NOT NULL,
  property_id UUID REFERENCES properties(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method_id UUID REFERENCES payment_methods(id) NOT NULL,
  schedule_type VARCHAR(20) CHECK (schedule_type IN ('monthly', 'biweekly', 'weekly')) NOT NULL,
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_active BOOLEAN DEFAULT TRUE,
  next_payment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, property_id)
);

-- Payment Notifications Table
CREATE TABLE IF NOT EXISTS payment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_accounts_user_id ON payment_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_type ON payment_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_rent_payments_tenant_id ON rent_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_landlord_id ON rent_payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_property_id ON rent_payments(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_status ON rent_payments(status);
CREATE INDEX IF NOT EXISTS idx_rent_payments_due_date ON rent_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_auto_pay_configs_tenant_id ON auto_pay_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_pay_configs_next_payment ON auto_pay_configs(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_user_id ON payment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_read ON payment_notifications(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_pay_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Payment Accounts: Users can only access their own accounts
CREATE POLICY "Users can view their own payment accounts" ON payment_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment accounts" ON payment_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment accounts" ON payment_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment Methods: Users can only access their own payment methods
CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- Rent Payments: Tenants and landlords can view their own payments
CREATE POLICY "Users can view their own rent payments" ON rent_payments
  FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "System can insert rent payments" ON rent_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update rent payments" ON rent_payments
  FOR UPDATE USING (true);

-- Payment Transactions: Users can view transactions for their payments
CREATE POLICY "Users can view their payment transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rent_payments 
      WHERE rent_payments.id = payment_transactions.payment_id 
      AND (rent_payments.tenant_id = auth.uid() OR rent_payments.landlord_id = auth.uid())
    )
  );

CREATE POLICY "System can insert payment transactions" ON payment_transactions
  FOR INSERT WITH CHECK (true);

-- Auto-Pay Configs: Users can only access their own auto-pay configs
CREATE POLICY "Users can view their own auto-pay configs" ON auto_pay_configs
  FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Users can insert their own auto-pay configs" ON auto_pay_configs
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update their own auto-pay configs" ON auto_pay_configs
  FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Users can delete their own auto-pay configs" ON auto_pay_configs
  FOR DELETE USING (auth.uid() = tenant_id);

-- Payment Notifications: Users can only access their own notifications
CREATE POLICY "Users can view their own notifications" ON payment_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON payment_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON payment_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_payment_accounts_updated_at BEFORE UPDATE ON payment_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rent_payments_updated_at BEFORE UPDATE ON rent_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_pay_configs_updated_at BEFORE UPDATE ON auto_pay_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate platform fees
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(amount * 0.025, 2); -- 2.5% platform fee
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate late fees
CREATE OR REPLACE FUNCTION calculate_late_fee(amount DECIMAL, days_late INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    IF days_late <= 0 THEN
        RETURN 0;
    ELSIF days_late <= 5 THEN
        RETURN ROUND(amount * 0.05, 2); -- 5% late fee
    ELSE
        RETURN ROUND(amount * 0.10, 2); -- 10% late fee for more than 5 days
    END IF;
END;
$$ LANGUAGE plpgsql;
