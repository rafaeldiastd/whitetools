-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. Transfer Lists Table
CREATE TABLE IF NOT EXISTS transfer_lists (
    id TEXT PRIMARY KEY, -- Generated 8-char code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    title TEXT,
    description TEXT,
    alliance_invites JSONB, -- Stores tags, spots, and passwords: {"TAG": {"spots": 10, "password": "..."}}
    requirements JSONB, -- Stores max_power, min_furnace, etc.
    access_key TEXT -- Admin password
);

-- 2. Transfer Invites Table (Players added to a list)
CREATE TABLE IF NOT EXISTS transfer_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    transfer_list_id TEXT REFERENCES transfer_lists(id) ON DELETE CASCADE,
    fid TEXT, -- Player ID (in-game)
    nickname TEXT,
    avatar_image TEXT,
    state_id TEXT, -- Player's original state
    stove_lv INTEGER,
    stove_lv_content TEXT, -- Image URL for furnace level
    alliance_target TEXT, -- The alliance they are invited to
    labyrinth INTEGER,
    power NUMERIC -- Power value
);

-- 3. Schedule Links Table
CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Or text if using short codes, store uses generateUniqueCode(6) which is text?
    -- Wait, store uses generateUniqueCode(6) but supabase might auto-gen UUID if not provided? 
    -- Store code: insert([{ access_key, ... }]).select().single()
    -- It does NOT send ID. So ID is likely auto-generated UUID or INT. 
    -- Let's assume UUID based on typical Supabase patterns.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    access_key TEXT,
    title TEXT,
    description TEXT,
    training_time TIMESTAMP WITH TIME ZONE,
    construction_time TIMESTAMP WITH TIME ZONE,
    research_time TIMESTAMP WITH TIME ZONE
);

-- 4. Players Table (Global cache of players for Schedule)
CREATE TABLE IF NOT EXISTS players (
    player_id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    player_name TEXT,
    player_avatar TEXT
);

-- 5. Schedule Slots Table
CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    link_id UUID REFERENCES links(id) ON DELETE CASCADE,
    slot_date DATE,
    start_time TIME,
    end_time TIME,
    is_booked BOOLEAN DEFAULT FALSE,
    player_id TEXT REFERENCES players(player_id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Hives Table (From previous context)
CREATE TABLE IF NOT EXISTS hives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    alliance_name TEXT,
    payload JSONB
);

-- RLS Policies (Basic Public Access for Prototype)
ALTER TABLE transfer_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access to transfer_lists" ON transfer_lists FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE transfer_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access to transfer_invites" ON transfer_invites FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access to links" ON links FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access to players" ON players FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access to slots" ON slots FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE hives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access to hives" ON hives FOR ALL USING (true) WITH CHECK (true);
