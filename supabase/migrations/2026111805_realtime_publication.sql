-- VizTR — Enable Realtime for dashboard sync tables
-- Add tables to supabase_realtime publication for live dashboard updates

alter publication supabase_realtime add table editor_scenes;
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table messages;
