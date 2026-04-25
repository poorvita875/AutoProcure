-- =============================================================================
-- AutoProcure AI – Database initialisation
-- Run once against your PostgreSQL database:
--     psql -U postgres -d autoprocure -f db/init.sql
-- =============================================================================

-- ── vendors ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
    id            SERIAL PRIMARY KEY,
    name          TEXT        NOT NULL,
    contact_email TEXT        NOT NULL,
    category      TEXT        NOT NULL DEFAULT 'General',   -- Manufacturing | Pharma | Construction | General
    country       TEXT        NOT NULL DEFAULT 'India',
    risk_score    NUMERIC(4,2) NOT NULL DEFAULT 5.0,        -- lower is safer
    risk_level    TEXT        NOT NULL DEFAULT 'Medium'     -- Low | Medium | High
);

-- ── rfqs ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rfqs (
    id                 SERIAL PRIMARY KEY,
    user_id            INTEGER,                             -- nullable; set when auth is added
    plain_text_request TEXT        NOT NULL,
    generated_rfq      TEXT        NOT NULL,
    status             TEXT        NOT NULL DEFAULT 'pending',  -- pending | sent | closed
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── rfq_bids ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rfq_bids (
    id            SERIAL PRIMARY KEY,
    rfq_id        INTEGER     NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id     INTEGER     NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    bid_amount    NUMERIC(12,2),
    delivery_days INTEGER,
    terms         TEXT,
    rank          INTEGER
);

-- ── audit_log ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id          SERIAL PRIMARY KEY,
    agent_name  TEXT        NOT NULL,
    action      TEXT        NOT NULL,
    result      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── agent_tasks ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_tasks (
    id          SERIAL PRIMARY KEY,
    task_id     TEXT        NOT NULL UNIQUE,
    agent_name  TEXT        NOT NULL,
    input_data  JSONB,
    output_data JSONB,
    status      TEXT        NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Seed vendors ─────────────────────────────────────────────────────────────
INSERT INTO vendors (name, contact_email, category, country, risk_score, risk_level)
VALUES
    ('SteelCo India',     'billing@steelco.in',     'Manufacturing', 'India', 2.1, 'Low'),
    ('BuildRight Pvt',    'supply@buildright.in',   'Construction',  'India', 1.8, 'Low'),
    ('MetalWorks Ltd',    'orders@metalworks.in',   'General',       'India', 3.5, 'Medium'),
    ('PharmaBase India',  'rfq@pharmabase.in',      'Pharma',        'India', 2.4, 'Low'),
    ('ConstructPro',      'bids@constructpro.in',   'Construction',  'India', 2.9, 'Medium'),
    ('AllGoods Supply',   'sales@allgoods.in',      'General',       'India', 4.1, 'Medium'),
    ('IndoMetal Corp',    'trade@indometal.in',      'Manufacturing', 'India', 1.5, 'Low')
ON CONFLICT DO NOTHING;
