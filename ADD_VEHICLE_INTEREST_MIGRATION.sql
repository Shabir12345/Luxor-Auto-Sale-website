-- Migration: Add vehicleInterest field to contact_submissions table
-- Run this SQL directly in your Supabase SQL Editor

-- Add the vehicleInterest column
ALTER TABLE "contact_submissions" 
ADD COLUMN IF NOT EXISTS "vehicleInterest" TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN "contact_submissions"."vehicleInterest" IS 'The vehicle the customer is inquiring about or interested in';
