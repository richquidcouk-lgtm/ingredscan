CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  source text,
  created_at timestamptz default now(),
  confirmed boolean default false
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can read subscribers" ON newsletter_subscribers FOR SELECT USING (true);
