CREATE TABLE IF NOT EXISTS feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  email text,
  message text not null,
  page text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS product_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  barcode text references products(barcode) on delete cascade,
  issue_type text not null,
  description text,
  created_at timestamptz default now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert product_reports" ON product_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can read feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Service can read product_reports" ON product_reports FOR SELECT USING (true);
