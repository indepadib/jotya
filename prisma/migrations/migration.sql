-- Add style column to Listing table
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "style" TEXT;
