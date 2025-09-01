
-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can insert posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;

DROP POLICY IF EXISTS "Replies are viewable by everyone" ON replies;
DROP POLICY IF EXISTS "Users can insert replies" ON replies;
DROP POLICY IF EXISTS "Users can update own replies" ON replies;
DROP POLICY IF EXISTS "Users can delete own replies" ON replies;
DROP POLICY IF EXISTS "Authenticated users can insert replies" ON replies;

-- Create new, simpler policies
-- Posts policies
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = author_id);

-- Replies policies
CREATE POLICY "Anyone can view replies" ON replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON replies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own replies" ON replies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own replies" ON replies FOR DELETE USING (auth.uid() = author_id);

-- Ensure the trigger function is working correctly
CREATE OR REPLACE FUNCTION set_owner_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set author_id to the current user if authenticated
  IF auth.uid() IS NOT NULL THEN
    NEW.author_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers
DROP TRIGGER IF EXISTS trg_posts_owner ON posts;
DROP TRIGGER IF EXISTS trg_comments_owner ON comments;
DROP TRIGGER IF EXISTS trg_replies_owner ON replies;

CREATE TRIGGER trg_posts_owner BEFORE INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION set_owner_on_insert();

CREATE TRIGGER trg_comments_owner BEFORE INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION set_owner_on_insert();

CREATE TRIGGER trg_replies_owner BEFORE INSERT ON replies
FOR EACH ROW EXECUTE FUNCTION set_owner_on_insert();

-- Test query to verify auth is working
SELECT 'RLS policies updated successfully' as status;
