-- Fix RLS policies to allow authenticated users to create posts
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert posts" ON posts;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can insert replies" ON replies;

-- Create new policies that allow authenticated users to insert
CREATE POLICY "Authenticated users can insert posts" ON posts 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert comments" ON comments 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert replies" ON replies 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure the trigger sets the author_id correctly
-- The trigger should already handle this, but let's make sure
CREATE OR REPLACE FUNCTION set_owner_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.author_id := COALESCE(NEW.author_id, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
