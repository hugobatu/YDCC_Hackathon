-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.aquatic_species (
  species_id character varying NOT NULL,
  species_name character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT aquatic_species_pkey PRIMARY KEY (species_id)
);
CREATE TABLE public.pool (
  pool_id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  region_id uuid NOT NULL,
  species_id character varying NOT NULL,
  pool_name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  updated_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT pool_pkey PRIMARY KEY (pool_id),
  CONSTRAINT pool_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.aquatic_species(species_id),
  CONSTRAINT pool_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.region(region_id),
  CONSTRAINT pool_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.user(user_id)
);
CREATE TABLE public.region (
  region_id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_name character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT region_pkey PRIMARY KEY (region_id)
);
CREATE TABLE public.user (
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  fullname character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT user_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.water_measurement (
  measure_id uuid NOT NULL DEFAULT gen_random_uuid(),
  dissolved_oxygen double precision,
  ph double precision,
  amonia double precision,
  turbidity double precision,
  temperature double precision,
  pool_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  CONSTRAINT water_measurement_pkey PRIMARY KEY (measure_id),
  CONSTRAINT water_measurement_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES public.pool(pool_id)
);