-- Add carfaxUrl column to vehicles table
-- Run this in Supabase SQL Editor

ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "carfaxUrl" TEXT;

