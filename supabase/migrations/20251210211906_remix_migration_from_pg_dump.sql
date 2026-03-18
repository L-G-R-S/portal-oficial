CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'marketing',
    'comercial',
    'executivo'
);


--
-- Name: get_current_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_user_role() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'), 'marketing');
  RETURN NEW;
END;
$$;


--
-- Name: update_companies_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_companies_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_competitors_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_competitors_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_profiles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_profiles_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: analysis_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analysis_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    domain text NOT NULL,
    status text DEFAULT 'pending'::text,
    progress integer DEFAULT 0,
    result_company_id uuid,
    error_message text,
    raw_payload jsonb,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: client_glassdoor_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_glassdoor_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    overall_rating numeric,
    ceo_rating numeric,
    recommend_to_friend numeric,
    culture_values_rating numeric,
    work_life_balance_rating numeric,
    career_opportunities_rating numeric,
    compensation_benefits_rating numeric,
    diversity_inclusion_rating numeric,
    pros_example text,
    cons_example text,
    advice_example text,
    reviews jsonb DEFAULT '[]'::jsonb,
    salaries jsonb DEFAULT '[]'::jsonb,
    benefits jsonb DEFAULT '[]'::jsonb,
    interviews jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_instagram_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_instagram_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    external_id text,
    caption text,
    url text,
    media_type text,
    media_url text,
    thumbnail_url text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    "timestamp" timestamp with time zone,
    mentions text,
    hashtags text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_leadership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_leadership (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    name text,
    "position" text,
    linkedin_url text,
    decision_level text,
    relevance_score numeric,
    source text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_linkedin_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_linkedin_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    external_id text,
    text text,
    post_type text,
    posted_at timestamp with time zone,
    total_reactions integer DEFAULT 0,
    likes integer DEFAULT 0,
    loves integer DEFAULT 0,
    celebrates integer DEFAULT 0,
    reposts integer DEFAULT 0,
    comments integer DEFAULT 0,
    media_type text,
    media_url text,
    media_thumbnail text,
    media_duration_ms integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_market_news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_market_news (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    title text,
    url text,
    date timestamp with time zone,
    summary text,
    classification text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_market_research; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_market_research (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    institutional_discourse text,
    positioning_discourse text,
    recurring_topics jsonb DEFAULT '[]'::jsonb,
    digital_presence jsonb,
    public_actions jsonb,
    institutional_curiosities jsonb DEFAULT '[]'::jsonb,
    institutional_materials jsonb DEFAULT '[]'::jsonb,
    overall_analysis text,
    strategic_analysis jsonb,
    swot_analysis jsonb,
    events jsonb DEFAULT '[]'::jsonb,
    source_references text,
    central_message text,
    topics_discussed text,
    curiosities text,
    blog_url text,
    website_url text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_similar_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_similar_companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    name text,
    industry text,
    location text,
    url text,
    logo_url text,
    source text DEFAULT 'linkedin_similar'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_youtube_videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_youtube_videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    external_id text,
    title text,
    url text,
    thumbnail_url text,
    view_count integer DEFAULT 0,
    likes integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain text NOT NULL,
    name text,
    sector text,
    industry text,
    employee_count integer,
    headquarters text,
    year_founded integer,
    website text,
    linkedin_url text,
    logo_url text,
    cover_url text,
    description text,
    tagline text,
    address text,
    phone text,
    business_model text,
    market text,
    type text,
    size text,
    linkedin_followers integer,
    linkedin_tagline text,
    linkedin_industry text,
    linkedin_specialties text[],
    instagram_url text,
    instagram_username text,
    instagram_bio text,
    instagram_followers integer,
    instagram_follows integer,
    instagram_posts_count integer,
    instagram_profile_picture text,
    youtube_url text,
    youtube_channel_name text,
    youtube_subscribers integer,
    youtube_total_videos integer,
    youtube_total_views integer,
    tiktok_url text,
    products_services jsonb DEFAULT '[]'::jsonb,
    differentiators jsonb DEFAULT '[]'::jsonb,
    partners jsonb DEFAULT '[]'::jsonb,
    clients jsonb,
    all_locations jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain text NOT NULL,
    name text,
    website text,
    description text,
    industry text,
    headquarters text,
    year_founded integer,
    size text,
    type text,
    market text,
    business_model text,
    logo_url text,
    linkedin_url text,
    instagram_url text,
    youtube_url text,
    tiktok_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    linkedin_followers integer,
    linkedin_industry text,
    linkedin_specialties text[],
    linkedin_tagline text,
    instagram_username text,
    instagram_followers integer,
    instagram_follows integer,
    instagram_posts_count integer,
    instagram_bio text,
    instagram_profile_picture text,
    youtube_channel_name text,
    youtube_subscribers integer,
    youtube_total_views integer,
    youtube_total_videos integer,
    products_services jsonb DEFAULT '[]'::jsonb,
    differentiators jsonb DEFAULT '[]'::jsonb,
    partners jsonb DEFAULT '[]'::jsonb,
    clients jsonb,
    cover_url text,
    employee_count integer,
    all_locations jsonb DEFAULT '[]'::jsonb,
    tagline text,
    sector text,
    address text,
    phone text
);


--
-- Name: company_competitors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_competitors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text,
    website text,
    industry text,
    location text,
    evidence text,
    source text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_leadership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_leadership (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text,
    "position" text,
    linkedin_url text,
    decision_level text,
    relevance_score numeric,
    source text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: competitors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competitors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain text NOT NULL,
    name text,
    sector text,
    employees integer,
    hq_location text,
    company_type text,
    founded_year integer,
    website text,
    linkedin_url text,
    linkedin_followers integer,
    glassdoor_url text,
    glassdoor_rating numeric(3,1),
    glassdoor_reviews integer,
    glassdoor_recommend_percent numeric(5,2),
    glassdoor_ceo_approval numeric(5,2),
    channels_json jsonb,
    recent_content jsonb,
    competitors_json jsonb,
    payload_json jsonb,
    collected_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    queried_at timestamp with time zone,
    site text,
    industry text,
    location text,
    logo_url text,
    short_description text,
    general_summary text,
    social_channels jsonb DEFAULT '{}'::jsonb,
    useful_links jsonb DEFAULT '{}'::jsonb,
    pricing_info jsonb,
    job_listings jsonb DEFAULT '[]'::jsonb,
    changelog jsonb DEFAULT '[]'::jsonb,
    status_info jsonb,
    documentation jsonb DEFAULT '[]'::jsonb,
    customer_cases jsonb DEFAULT '[]'::jsonb,
    third_party_reviews jsonb DEFAULT '[]'::jsonb,
    related_searches jsonb DEFAULT '[]'::jsonb,
    recent_mentions jsonb DEFAULT '[]'::jsonb,
    observations jsonb DEFAULT '[]'::jsonb,
    raw_data jsonb,
    paa jsonb DEFAULT '[]'::jsonb,
    annual_revenue text,
    linkedin_tagline text,
    linkedin_specialties text[],
    instagram_username text,
    instagram_bio text,
    youtube_channel_name text,
    youtube_subscribers integer,
    youtube_total_views integer,
    youtube_total_videos integer,
    products_services jsonb DEFAULT '[]'::jsonb,
    differentiators jsonb DEFAULT '[]'::jsonb,
    partners jsonb DEFAULT '[]'::jsonb,
    clients text,
    instagram_followers integer,
    instagram_posts_count integer,
    cover_url text,
    employee_count integer,
    all_locations jsonb DEFAULT '[]'::jsonb,
    tagline text
);


--
-- Name: glassdoor_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.glassdoor_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    overall_rating numeric,
    compensation_benefits_rating numeric,
    culture_values_rating numeric,
    career_opportunities_rating numeric,
    work_life_balance_rating numeric,
    diversity_inclusion_rating numeric,
    recommend_to_friend numeric,
    ceo_rating numeric,
    ratings_one_star integer,
    ratings_two_stars integer,
    ratings_three_stars integer,
    ratings_four_stars integer,
    ratings_five_stars integer,
    pros_example text,
    cons_example text,
    advice_example text,
    created_at timestamp with time zone DEFAULT now(),
    reviews jsonb DEFAULT '[]'::jsonb,
    salaries jsonb DEFAULT '[]'::jsonb,
    benefits jsonb DEFAULT '[]'::jsonb,
    interviews jsonb DEFAULT '[]'::jsonb
);


--
-- Name: instagram_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instagram_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    external_id text,
    caption text,
    url text,
    media_type text,
    media_url text,
    thumbnail_url text,
    likes_count integer,
    comments_count integer,
    shares_count integer,
    mentions text,
    hashtags text,
    "timestamp" timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: linkedin_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.linkedin_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    external_id text,
    text text,
    post_type text,
    posted_at timestamp with time zone,
    url text,
    total_reactions integer,
    likes integer,
    loves integer,
    celebrates integer,
    reposts integer,
    comments integer,
    media_type text,
    media_url text,
    media_thumbnail text,
    media_duration_ms integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: market_news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.market_news (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    title text,
    url text,
    date timestamp with time zone,
    summary text,
    classification text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: market_research; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.market_research (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    central_message text,
    topics_discussed text,
    digital_presence jsonb,
    curiosities text,
    overall_analysis text,
    source_references text,
    created_at timestamp with time zone DEFAULT now(),
    institutional_discourse text,
    recurring_topics jsonb DEFAULT '[]'::jsonb,
    institutional_curiosities jsonb DEFAULT '[]'::jsonb,
    institutional_materials jsonb DEFAULT '[]'::jsonb,
    events jsonb DEFAULT '[]'::jsonb,
    website_url text,
    blog_url text,
    positioning_discourse text,
    public_actions jsonb,
    swot_analysis jsonb,
    strategic_analysis jsonb
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text,
    read boolean DEFAULT false,
    action_url text,
    action_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['success'::text, 'error'::text, 'info'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    role public.user_role DEFAULT 'marketing'::public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    avatar_url text
);


--
-- Name: prospect_glassdoor_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospect_glassdoor_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prospect_id uuid,
    overall_rating numeric,
    ceo_rating numeric,
    recommend_to_friend numeric,
    culture_values_rating numeric,
    work_life_balance_rating numeric,
    career_opportunities_rating numeric,
    compensation_benefits_rating numeric,
    diversity_inclusion_rating numeric,
    pros_example text,
    cons_example text,
    advice_example text,
    reviews jsonb DEFAULT '[]'::jsonb,
    salaries jsonb DEFAULT '[]'::jsonb,
    benefits jsonb DEFAULT '[]'::jsonb,
    interviews jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: prospect_instagram_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospect_instagram_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prospect_id uuid,
    external_id text,
    caption text,
    url text,
    media_type text,
    media_url text,
    thumbnail_url text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    "timestamp" timestamp with time zone,
    mentions text,
    hashtags text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: prospect_leadership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospect_leadership (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prospect_id uuid,
    name text,
    "position" text,
    linkedin_url text,
    decision_level text,
    relevance_score numeric,
    source text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: prospect_linkedin_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospect_linkedin_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prospect_id uuid,
    external_id text,
    text text,
    post_type text,
    posted_at timestamp with time zone,
    total_reactions integer DEFAULT 0,
    likes integer DEFAULT 0,
    loves integer DEFAULT 0,
    celebrates integer DEFAULT 0,
    reposts integer DEFAULT 0,
    comments integer DEFAULT 0,
    media_type text,
    media_url text,
    media_thumbnail text,
    media_duration_ms integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: prospect_market_news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospect_market_news (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prospect_id uuid,
    title text,
    url text,
    date timestamp with time zone,
    summary text,
    classification text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: prospect_market_research; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospect_market_research (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prospect_id uuid,
    institutional_discourse text,
    positioning_discourse text,
    recurring_topics jsonb DEFAULT '[]'::jsonb,
    digital_presence jsonb,
    public_actions jsonb,
    institutional_curiosities jsonb DEFAULT '[]'::jsonb,
    institutional_materials jsonb DEFAULT '[]'::jsonb,
    overall_analysis text,
    strategic_analysis jsonb,
    swot_analysis jsonb,
    events jsonb DEFAULT '[]'::jsonb,
    source_references text,
    central_message text,
    topics_discussed text,
    curiosities text,
    blog_url text,
    website_url text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: prospect_similar_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospect_similar_companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prospect_id uuid,
    name text,
    industry text,
    location text,
    url text,
    logo_url text,
    source text DEFAULT 'linkedin_similar'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: prospect_youtube_videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospect_youtube_videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prospect_id uuid,
    external_id text,
    title text,
    url text,
    thumbnail_url text,
    view_count integer DEFAULT 0,
    likes integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: prospects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain text NOT NULL,
    name text,
    sector text,
    industry text,
    employee_count integer,
    headquarters text,
    year_founded integer,
    website text,
    linkedin_url text,
    logo_url text,
    cover_url text,
    description text,
    tagline text,
    address text,
    phone text,
    business_model text,
    market text,
    type text,
    size text,
    linkedin_followers integer,
    linkedin_tagline text,
    linkedin_industry text,
    linkedin_specialties text[],
    instagram_url text,
    instagram_username text,
    instagram_bio text,
    instagram_followers integer,
    instagram_follows integer,
    instagram_posts_count integer,
    instagram_profile_picture text,
    youtube_url text,
    youtube_channel_name text,
    youtube_subscribers integer,
    youtube_total_videos integer,
    youtube_total_views integer,
    tiktok_url text,
    products_services jsonb DEFAULT '[]'::jsonb,
    differentiators jsonb DEFAULT '[]'::jsonb,
    partners jsonb DEFAULT '[]'::jsonb,
    clients jsonb,
    all_locations jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: similar_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.similar_companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text,
    industry text,
    location text,
    url text,
    logo_url text,
    source text DEFAULT 'linkedin_similar'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: update_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.update_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    total_entities integer DEFAULT 0,
    entities_updated integer DEFAULT 0,
    status text DEFAULT 'pending'::text,
    error_message text,
    entity_types text[] DEFAULT ARRAY['competitor'::text, 'prospect'::text, 'client'::text],
    current_entity_name text,
    current_entity_domain text
);


--
-- Name: update_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.update_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    is_enabled boolean DEFAULT false,
    frequency_minutes integer DEFAULT 10080,
    last_update_at timestamp with time zone,
    next_update_at timestamp with time zone,
    update_competitors boolean DEFAULT true,
    update_prospects boolean DEFAULT true,
    update_clients boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    update_type text DEFAULT 'full'::text,
    CONSTRAINT update_settings_update_type_check CHECK ((update_type = ANY (ARRAY['full'::text, 'news_only'::text])))
);


--
-- Name: youtube_videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.youtube_videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    external_id text,
    title text,
    url text,
    thumbnail_url text,
    view_count integer,
    likes integer,
    comments_count integer,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: analysis_jobs analysis_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_jobs
    ADD CONSTRAINT analysis_jobs_pkey PRIMARY KEY (id);


--
-- Name: client_glassdoor_summary client_glassdoor_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_glassdoor_summary
    ADD CONSTRAINT client_glassdoor_summary_pkey PRIMARY KEY (id);


--
-- Name: client_instagram_posts client_instagram_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_instagram_posts
    ADD CONSTRAINT client_instagram_posts_pkey PRIMARY KEY (id);


--
-- Name: client_leadership client_leadership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_leadership
    ADD CONSTRAINT client_leadership_pkey PRIMARY KEY (id);


--
-- Name: client_linkedin_posts client_linkedin_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_linkedin_posts
    ADD CONSTRAINT client_linkedin_posts_pkey PRIMARY KEY (id);


--
-- Name: client_market_news client_market_news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_market_news
    ADD CONSTRAINT client_market_news_pkey PRIMARY KEY (id);


--
-- Name: client_market_research client_market_research_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_market_research
    ADD CONSTRAINT client_market_research_pkey PRIMARY KEY (id);


--
-- Name: client_similar_companies client_similar_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_similar_companies
    ADD CONSTRAINT client_similar_companies_pkey PRIMARY KEY (id);


--
-- Name: client_youtube_videos client_youtube_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_youtube_videos
    ADD CONSTRAINT client_youtube_videos_pkey PRIMARY KEY (id);


--
-- Name: clients clients_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_domain_key UNIQUE (domain);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: companies companies_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_domain_key UNIQUE (domain);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_competitors company_competitors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_competitors
    ADD CONSTRAINT company_competitors_pkey PRIMARY KEY (id);


--
-- Name: company_leadership company_leadership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_leadership
    ADD CONSTRAINT company_leadership_pkey PRIMARY KEY (id);


--
-- Name: competitors competitors_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competitors
    ADD CONSTRAINT competitors_domain_key UNIQUE (domain);


--
-- Name: competitors competitors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competitors
    ADD CONSTRAINT competitors_pkey PRIMARY KEY (id);


--
-- Name: glassdoor_summary glassdoor_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.glassdoor_summary
    ADD CONSTRAINT glassdoor_summary_pkey PRIMARY KEY (id);


--
-- Name: instagram_posts instagram_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instagram_posts
    ADD CONSTRAINT instagram_posts_pkey PRIMARY KEY (id);


--
-- Name: linkedin_posts linkedin_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linkedin_posts
    ADD CONSTRAINT linkedin_posts_pkey PRIMARY KEY (id);


--
-- Name: market_news market_news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_news
    ADD CONSTRAINT market_news_pkey PRIMARY KEY (id);


--
-- Name: market_research market_research_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_research
    ADD CONSTRAINT market_research_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: prospect_glassdoor_summary prospect_glassdoor_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_glassdoor_summary
    ADD CONSTRAINT prospect_glassdoor_summary_pkey PRIMARY KEY (id);


--
-- Name: prospect_instagram_posts prospect_instagram_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_instagram_posts
    ADD CONSTRAINT prospect_instagram_posts_pkey PRIMARY KEY (id);


--
-- Name: prospect_leadership prospect_leadership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_leadership
    ADD CONSTRAINT prospect_leadership_pkey PRIMARY KEY (id);


--
-- Name: prospect_linkedin_posts prospect_linkedin_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_linkedin_posts
    ADD CONSTRAINT prospect_linkedin_posts_pkey PRIMARY KEY (id);


--
-- Name: prospect_market_news prospect_market_news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_market_news
    ADD CONSTRAINT prospect_market_news_pkey PRIMARY KEY (id);


--
-- Name: prospect_market_research prospect_market_research_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_market_research
    ADD CONSTRAINT prospect_market_research_pkey PRIMARY KEY (id);


--
-- Name: prospect_similar_companies prospect_similar_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_similar_companies
    ADD CONSTRAINT prospect_similar_companies_pkey PRIMARY KEY (id);


--
-- Name: prospect_youtube_videos prospect_youtube_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_youtube_videos
    ADD CONSTRAINT prospect_youtube_videos_pkey PRIMARY KEY (id);


--
-- Name: prospects prospects_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospects
    ADD CONSTRAINT prospects_domain_key UNIQUE (domain);


--
-- Name: prospects prospects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospects
    ADD CONSTRAINT prospects_pkey PRIMARY KEY (id);


--
-- Name: similar_companies similar_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.similar_companies
    ADD CONSTRAINT similar_companies_pkey PRIMARY KEY (id);


--
-- Name: update_logs update_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_logs
    ADD CONSTRAINT update_logs_pkey PRIMARY KEY (id);


--
-- Name: update_settings update_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_settings
    ADD CONSTRAINT update_settings_pkey PRIMARY KEY (id);


--
-- Name: youtube_videos youtube_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.youtube_videos
    ADD CONSTRAINT youtube_videos_pkey PRIMARY KEY (id);


--
-- Name: competitors_domain_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX competitors_domain_idx ON public.competitors USING btree (domain);


--
-- Name: competitors_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX competitors_name_idx ON public.competitors USING btree (name);


--
-- Name: idx_analysis_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analysis_jobs_status ON public.analysis_jobs USING btree (status);


--
-- Name: idx_analysis_jobs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analysis_jobs_user_id ON public.analysis_jobs USING btree (user_id);


--
-- Name: idx_companies_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_domain ON public.companies USING btree (domain);


--
-- Name: idx_company_competitors_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_competitors_company_id ON public.company_competitors USING btree (company_id);


--
-- Name: idx_company_leadership_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_leadership_company_id ON public.company_leadership USING btree (company_id);


--
-- Name: idx_competitors_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_competitors_domain ON public.competitors USING btree (domain);


--
-- Name: idx_competitors_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_competitors_updated_at ON public.competitors USING btree (updated_at DESC);


--
-- Name: idx_glassdoor_summary_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_glassdoor_summary_company_id ON public.glassdoor_summary USING btree (company_id);


--
-- Name: idx_instagram_posts_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_instagram_posts_company_id ON public.instagram_posts USING btree (company_id);


--
-- Name: idx_linkedin_posts_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_linkedin_posts_company_id ON public.linkedin_posts USING btree (company_id);


--
-- Name: idx_market_news_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_market_news_company_id ON public.market_news USING btree (company_id);


--
-- Name: idx_market_research_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_market_research_company_id ON public.market_research USING btree (company_id);


--
-- Name: idx_similar_companies_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_similar_companies_company_id ON public.similar_companies USING btree (company_id);


--
-- Name: idx_youtube_videos_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_youtube_videos_company_id ON public.youtube_videos USING btree (company_id);


--
-- Name: companies companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_companies_updated_at();


--
-- Name: companies update_companies_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_companies_updated_at_trigger BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_companies_updated_at();


--
-- Name: competitors update_competitors_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_competitors_timestamp BEFORE UPDATE ON public.competitors FOR EACH ROW EXECUTE FUNCTION public.update_competitors_updated_at();


--
-- Name: competitors update_competitors_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_competitors_updated_at_trigger BEFORE UPDATE ON public.competitors FOR EACH ROW EXECUTE FUNCTION public.update_competitors_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();


--
-- Name: update_settings update_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.update_settings FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();


--
-- Name: analysis_jobs analysis_jobs_result_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_jobs
    ADD CONSTRAINT analysis_jobs_result_company_id_fkey FOREIGN KEY (result_company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: analysis_jobs analysis_jobs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analysis_jobs
    ADD CONSTRAINT analysis_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: client_glassdoor_summary client_glassdoor_summary_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_glassdoor_summary
    ADD CONSTRAINT client_glassdoor_summary_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_instagram_posts client_instagram_posts_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_instagram_posts
    ADD CONSTRAINT client_instagram_posts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_leadership client_leadership_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_leadership
    ADD CONSTRAINT client_leadership_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_linkedin_posts client_linkedin_posts_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_linkedin_posts
    ADD CONSTRAINT client_linkedin_posts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_market_news client_market_news_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_market_news
    ADD CONSTRAINT client_market_news_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_market_research client_market_research_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_market_research
    ADD CONSTRAINT client_market_research_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_similar_companies client_similar_companies_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_similar_companies
    ADD CONSTRAINT client_similar_companies_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_youtube_videos client_youtube_videos_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_youtube_videos
    ADD CONSTRAINT client_youtube_videos_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: company_competitors company_competitors_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_competitors
    ADD CONSTRAINT company_competitors_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_leadership company_leadership_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_leadership
    ADD CONSTRAINT company_leadership_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: glassdoor_summary glassdoor_summary_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.glassdoor_summary
    ADD CONSTRAINT glassdoor_summary_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: instagram_posts instagram_posts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instagram_posts
    ADD CONSTRAINT instagram_posts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: linkedin_posts linkedin_posts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linkedin_posts
    ADD CONSTRAINT linkedin_posts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: market_news market_news_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_news
    ADD CONSTRAINT market_news_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: market_research market_research_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_research
    ADD CONSTRAINT market_research_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: prospect_glassdoor_summary prospect_glassdoor_summary_prospect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_glassdoor_summary
    ADD CONSTRAINT prospect_glassdoor_summary_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: prospect_instagram_posts prospect_instagram_posts_prospect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_instagram_posts
    ADD CONSTRAINT prospect_instagram_posts_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: prospect_leadership prospect_leadership_prospect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_leadership
    ADD CONSTRAINT prospect_leadership_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: prospect_linkedin_posts prospect_linkedin_posts_prospect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_linkedin_posts
    ADD CONSTRAINT prospect_linkedin_posts_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: prospect_market_news prospect_market_news_prospect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_market_news
    ADD CONSTRAINT prospect_market_news_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: prospect_market_research prospect_market_research_prospect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_market_research
    ADD CONSTRAINT prospect_market_research_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: prospect_similar_companies prospect_similar_companies_prospect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_similar_companies
    ADD CONSTRAINT prospect_similar_companies_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: prospect_youtube_videos prospect_youtube_videos_prospect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospect_youtube_videos
    ADD CONSTRAINT prospect_youtube_videos_prospect_id_fkey FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: similar_companies similar_companies_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.similar_companies
    ADD CONSTRAINT similar_companies_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: youtube_videos youtube_videos_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.youtube_videos
    ADD CONSTRAINT youtube_videos_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: competitors Allow public delete from competitors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete from competitors" ON public.competitors FOR DELETE USING (true);


--
-- Name: competitors Allow public insert to competitors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert to competitors" ON public.competitors FOR INSERT WITH CHECK (true);


--
-- Name: competitors Allow public read access to competitors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to competitors" ON public.competitors FOR SELECT USING (true);


--
-- Name: competitors Allow public update to competitors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update to competitors" ON public.competitors FOR UPDATE USING (true);


--
-- Name: client_instagram_posts Authenticated users can delete client_instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete client_instagram_posts" ON public.client_instagram_posts FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_leadership Authenticated users can delete client_leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete client_leadership" ON public.client_leadership FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_linkedin_posts Authenticated users can delete client_linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete client_linkedin_posts" ON public.client_linkedin_posts FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_market_news Authenticated users can delete client_market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete client_market_news" ON public.client_market_news FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_market_research Authenticated users can delete client_market_research; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete client_market_research" ON public.client_market_research FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_similar_companies Authenticated users can delete client_similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete client_similar_companies" ON public.client_similar_companies FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_youtube_videos Authenticated users can delete client_youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete client_youtube_videos" ON public.client_youtube_videos FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: clients Authenticated users can delete clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: companies Authenticated users can delete companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete companies" ON public.companies FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: company_competitors Authenticated users can delete company_competitors_app; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete company_competitors_app" ON public.company_competitors FOR DELETE TO authenticated USING ((auth.role() = 'authenticated'::text));


--
-- Name: company_leadership Authenticated users can delete company_leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete company_leadership" ON public.company_leadership FOR DELETE TO authenticated USING ((auth.role() = 'authenticated'::text));


--
-- Name: instagram_posts Authenticated users can delete instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete instagram_posts" ON public.instagram_posts FOR DELETE TO authenticated USING ((auth.role() = 'authenticated'::text));


--
-- Name: linkedin_posts Authenticated users can delete linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete linkedin_posts" ON public.linkedin_posts FOR DELETE TO authenticated USING ((auth.role() = 'authenticated'::text));


--
-- Name: market_news Authenticated users can delete market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete market_news" ON public.market_news FOR DELETE TO authenticated USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_instagram_posts Authenticated users can delete prospect_instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete prospect_instagram_posts" ON public.prospect_instagram_posts FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_leadership Authenticated users can delete prospect_leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete prospect_leadership" ON public.prospect_leadership FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_linkedin_posts Authenticated users can delete prospect_linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete prospect_linkedin_posts" ON public.prospect_linkedin_posts FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_market_news Authenticated users can delete prospect_market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete prospect_market_news" ON public.prospect_market_news FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_market_research Authenticated users can delete prospect_market_research; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete prospect_market_research" ON public.prospect_market_research FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_similar_companies Authenticated users can delete prospect_similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete prospect_similar_companies" ON public.prospect_similar_companies FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_youtube_videos Authenticated users can delete prospect_youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete prospect_youtube_videos" ON public.prospect_youtube_videos FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospects Authenticated users can delete prospects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete prospects" ON public.prospects FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: similar_companies Authenticated users can delete similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete similar_companies" ON public.similar_companies FOR DELETE TO authenticated USING ((auth.role() = 'authenticated'::text));


--
-- Name: youtube_videos Authenticated users can delete youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete youtube_videos" ON public.youtube_videos FOR DELETE TO authenticated USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_glassdoor_summary Authenticated users can insert client_glassdoor_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert client_glassdoor_summary" ON public.client_glassdoor_summary FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: client_instagram_posts Authenticated users can insert client_instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert client_instagram_posts" ON public.client_instagram_posts FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: client_leadership Authenticated users can insert client_leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert client_leadership" ON public.client_leadership FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: client_linkedin_posts Authenticated users can insert client_linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert client_linkedin_posts" ON public.client_linkedin_posts FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: client_market_news Authenticated users can insert client_market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert client_market_news" ON public.client_market_news FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: client_market_research Authenticated users can insert client_market_research; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert client_market_research" ON public.client_market_research FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: client_similar_companies Authenticated users can insert client_similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert client_similar_companies" ON public.client_similar_companies FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: client_youtube_videos Authenticated users can insert client_youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert client_youtube_videos" ON public.client_youtube_videos FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: clients Authenticated users can insert clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: companies Authenticated users can insert companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert companies" ON public.companies FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: company_competitors Authenticated users can insert company_competitors_app; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert company_competitors_app" ON public.company_competitors FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: company_leadership Authenticated users can insert company_leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert company_leadership" ON public.company_leadership FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: glassdoor_summary Authenticated users can insert glassdoor_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert glassdoor_summary" ON public.glassdoor_summary FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: instagram_posts Authenticated users can insert instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert instagram_posts" ON public.instagram_posts FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: linkedin_posts Authenticated users can insert linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert linkedin_posts" ON public.linkedin_posts FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: market_news Authenticated users can insert market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert market_news" ON public.market_news FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: market_research Authenticated users can insert market_research; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert market_research" ON public.market_research FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_glassdoor_summary Authenticated users can insert prospect_glassdoor_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert prospect_glassdoor_summary" ON public.prospect_glassdoor_summary FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_instagram_posts Authenticated users can insert prospect_instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert prospect_instagram_posts" ON public.prospect_instagram_posts FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_leadership Authenticated users can insert prospect_leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert prospect_leadership" ON public.prospect_leadership FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_linkedin_posts Authenticated users can insert prospect_linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert prospect_linkedin_posts" ON public.prospect_linkedin_posts FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_market_news Authenticated users can insert prospect_market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert prospect_market_news" ON public.prospect_market_news FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_market_research Authenticated users can insert prospect_market_research; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert prospect_market_research" ON public.prospect_market_research FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_similar_companies Authenticated users can insert prospect_similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert prospect_similar_companies" ON public.prospect_similar_companies FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_youtube_videos Authenticated users can insert prospect_youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert prospect_youtube_videos" ON public.prospect_youtube_videos FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: prospects Authenticated users can insert prospects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert prospects" ON public.prospects FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: similar_companies Authenticated users can insert similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert similar_companies" ON public.similar_companies FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: youtube_videos Authenticated users can insert youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert youtube_videos" ON public.youtube_videos FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: client_glassdoor_summary Authenticated users can read client_glassdoor_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read client_glassdoor_summary" ON public.client_glassdoor_summary FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_instagram_posts Authenticated users can read client_instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read client_instagram_posts" ON public.client_instagram_posts FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_leadership Authenticated users can read client_leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read client_leadership" ON public.client_leadership FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_linkedin_posts Authenticated users can read client_linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read client_linkedin_posts" ON public.client_linkedin_posts FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_market_news Authenticated users can read client_market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read client_market_news" ON public.client_market_news FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_market_research Authenticated users can read client_market_research; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read client_market_research" ON public.client_market_research FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_similar_companies Authenticated users can read client_similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read client_similar_companies" ON public.client_similar_companies FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: client_youtube_videos Authenticated users can read client_youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read client_youtube_videos" ON public.client_youtube_videos FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: clients Authenticated users can read clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read clients" ON public.clients FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: companies Authenticated users can read companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read companies" ON public.companies FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: company_competitors Authenticated users can read company_competitors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read company_competitors" ON public.company_competitors FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: company_leadership Authenticated users can read company_leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read company_leadership" ON public.company_leadership FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: glassdoor_summary Authenticated users can read glassdoor_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read glassdoor_summary" ON public.glassdoor_summary FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: instagram_posts Authenticated users can read instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read instagram_posts" ON public.instagram_posts FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: linkedin_posts Authenticated users can read linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read linkedin_posts" ON public.linkedin_posts FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: market_news Authenticated users can read market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read market_news" ON public.market_news FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: market_research Authenticated users can read market_research; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read market_research" ON public.market_research FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_glassdoor_summary Authenticated users can read prospect_glassdoor_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read prospect_glassdoor_summary" ON public.prospect_glassdoor_summary FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_instagram_posts Authenticated users can read prospect_instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read prospect_instagram_posts" ON public.prospect_instagram_posts FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_leadership Authenticated users can read prospect_leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read prospect_leadership" ON public.prospect_leadership FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_linkedin_posts Authenticated users can read prospect_linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read prospect_linkedin_posts" ON public.prospect_linkedin_posts FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_market_news Authenticated users can read prospect_market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read prospect_market_news" ON public.prospect_market_news FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_market_research Authenticated users can read prospect_market_research; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read prospect_market_research" ON public.prospect_market_research FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_similar_companies Authenticated users can read prospect_similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read prospect_similar_companies" ON public.prospect_similar_companies FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospect_youtube_videos Authenticated users can read prospect_youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read prospect_youtube_videos" ON public.prospect_youtube_videos FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospects Authenticated users can read prospects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read prospects" ON public.prospects FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: similar_companies Authenticated users can read similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read similar_companies" ON public.similar_companies FOR SELECT TO authenticated USING (true);


--
-- Name: youtube_videos Authenticated users can read youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read youtube_videos" ON public.youtube_videos FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: clients Authenticated users can update clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: companies Authenticated users can update companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update companies" ON public.companies FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: prospects Authenticated users can update prospects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update prospects" ON public.prospects FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: company_competitors Service role can insert company_competitors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert company_competitors" ON public.company_competitors FOR INSERT WITH CHECK (true);


--
-- Name: glassdoor_summary Service role can insert glassdoor; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert glassdoor" ON public.glassdoor_summary FOR INSERT WITH CHECK (true);


--
-- Name: instagram_posts Service role can insert instagram_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert instagram_posts" ON public.instagram_posts FOR INSERT WITH CHECK (true);


--
-- Name: company_leadership Service role can insert leadership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert leadership" ON public.company_leadership FOR INSERT WITH CHECK (true);


--
-- Name: linkedin_posts Service role can insert linkedin_posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert linkedin_posts" ON public.linkedin_posts FOR INSERT WITH CHECK (true);


--
-- Name: market_news Service role can insert market_news; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert market_news" ON public.market_news FOR INSERT WITH CHECK (true);


--
-- Name: market_research Service role can insert market_research; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert market_research" ON public.market_research FOR INSERT WITH CHECK (true);


--
-- Name: notifications Service role can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: similar_companies Service role can insert similar_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert similar_companies" ON public.similar_companies FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: youtube_videos Service role can insert youtube_videos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert youtube_videos" ON public.youtube_videos FOR INSERT WITH CHECK (true);


--
-- Name: competitors Todos podem atualizar concorrentes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem atualizar concorrentes" ON public.competitors FOR UPDATE USING (true);


--
-- Name: competitors Todos podem deletar concorrentes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem deletar concorrentes" ON public.competitors FOR DELETE USING (true);


--
-- Name: competitors Todos podem inserir concorrentes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem inserir concorrentes" ON public.competitors FOR INSERT WITH CHECK (true);


--
-- Name: competitors Todos podem ver concorrentes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Todos podem ver concorrentes" ON public.competitors FOR SELECT USING (true);


--
-- Name: profiles Users can create their own profile with default role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own profile with default role" ON public.profiles FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (role = 'marketing'::public.user_role)));


--
-- Name: update_logs Users can delete their own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own logs" ON public.update_logs FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can delete their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: analysis_jobs Users can insert their own analysis jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own analysis jobs" ON public.analysis_jobs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: update_logs Users can insert their own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own logs" ON public.update_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: notifications Users can insert their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own notifications" ON public.notifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: update_settings Users can insert their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own settings" ON public.update_settings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: analysis_jobs Users can read their own analysis jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read their own analysis jobs" ON public.analysis_jobs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: analysis_jobs Users can update their own analysis jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own analysis jobs" ON public.analysis_jobs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: update_logs Users can update their own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own logs" ON public.update_logs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: update_settings Users can update their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own settings" ON public.update_settings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: update_logs Users can view their own logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own logs" ON public.update_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: update_settings Users can view their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own settings" ON public.update_settings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: analysis_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: client_glassdoor_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_glassdoor_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: client_instagram_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_instagram_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: client_leadership; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_leadership ENABLE ROW LEVEL SECURITY;

--
-- Name: client_linkedin_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_linkedin_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: client_market_news; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_market_news ENABLE ROW LEVEL SECURITY;

--
-- Name: client_market_research; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_market_research ENABLE ROW LEVEL SECURITY;

--
-- Name: client_similar_companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_similar_companies ENABLE ROW LEVEL SECURITY;

--
-- Name: client_youtube_videos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_youtube_videos ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

--
-- Name: company_competitors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_competitors ENABLE ROW LEVEL SECURITY;

--
-- Name: company_leadership; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_leadership ENABLE ROW LEVEL SECURITY;

--
-- Name: competitors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

--
-- Name: glassdoor_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.glassdoor_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: instagram_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: linkedin_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: market_news; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;

--
-- Name: market_research; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.market_research ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: prospect_glassdoor_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prospect_glassdoor_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: prospect_instagram_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prospect_instagram_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: prospect_leadership; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prospect_leadership ENABLE ROW LEVEL SECURITY;

--
-- Name: prospect_linkedin_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prospect_linkedin_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: prospect_market_news; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prospect_market_news ENABLE ROW LEVEL SECURITY;

--
-- Name: prospect_market_research; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prospect_market_research ENABLE ROW LEVEL SECURITY;

--
-- Name: prospect_similar_companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prospect_similar_companies ENABLE ROW LEVEL SECURITY;

--
-- Name: prospect_youtube_videos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prospect_youtube_videos ENABLE ROW LEVEL SECURITY;

--
-- Name: prospects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

--
-- Name: similar_companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.similar_companies ENABLE ROW LEVEL SECURITY;

--
-- Name: update_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.update_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: update_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.update_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles users_insert_own_profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_insert_own_profile ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles users_read_own_profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_read_own_profile ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles users_update_own_profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_update_own_profile ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: youtube_videos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


