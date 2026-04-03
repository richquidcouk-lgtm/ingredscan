ALTER TABLE profiles ADD COLUMN IF NOT EXISTS market text default 'uk';

CREATE TABLE IF NOT EXISTS market_waitlist (
  id uuid default gen_random_uuid() primary key,
  email text,
  market text not null,
  created_at timestamptz default now(),
  notified boolean default false
);

CREATE INDEX IF NOT EXISTS idx_market_waitlist_market ON market_waitlist(market);

ALTER TABLE market_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert market_waitlist" ON market_waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can read market_waitlist" ON market_waitlist FOR SELECT USING (true);
