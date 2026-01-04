-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.bearhive (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  state_number character varying NOT NULL,
  alliance_name text NOT NULL,
  url text,
  access_key text NOT NULL UNIQUE,
  map_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  description text,
  CONSTRAINT bearhive_pkey PRIMARY KEY (id)
);
CREATE TABLE public.links (
  access_key text NOT NULL UNIQUE,
  id text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text,
  training_time date,
  construction_time date,
  research_time date,
  description text,
  generated_link text,
  CONSTRAINT links_pkey PRIMARY KEY (id)
);
CREATE TABLE public.players (
  player_id bigint NOT NULL,
  player_name text,
  player_avatar text,
  CONSTRAINT players_pkey PRIMARY KEY (player_id)
);
CREATE TABLE public.slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  link_id text NOT NULL,
  end_time text NOT NULL,
  slot_date date NOT NULL,
  is_booked boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  player_id bigint,
  start_time text,
  CONSTRAINT slots_pkey PRIMARY KEY (id),
  CONSTRAINT slots_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.links(id),
  CONSTRAINT slots_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(player_id)
);
CREATE TABLE public.transfer_invites (
  transfer_list_id text NOT NULL,
  added_at timestamp with time zone DEFAULT now(),
  alliance_target text DEFAULT ''::text CHECK (length(alliance_target) <= 3),
  fid bigint NOT NULL,
  nickname text,
  state_id bigint,
  stove_lv bigint,
  stove_lv_content text,
  avatar_image text,
  power bigint,
  labyrinth bigint,
  type_invite text,
  CONSTRAINT transfer_invites_pkey PRIMARY KEY (transfer_list_id, fid),
  CONSTRAINT transfer_invites_transfer_list_id_fkey FOREIGN KEY (transfer_list_id) REFERENCES public.transfer_lists(id)
);
CREATE TABLE public.transfer_lists (
  id text NOT NULL,
  title text NOT NULL,
  description text,
  alliance_invites jsonb,
  requirements jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  access_key text,
  responsible_id text,
  responsible_data jsonb,
  CONSTRAINT transfer_lists_pkey PRIMARY KEY (id)
);