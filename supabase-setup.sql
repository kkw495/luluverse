-- 在 Supabase SQL Editor 中运行此脚本
-- https://supabase.com → 你的项目 → SQL Editor

CREATE TABLE IF NOT EXISTS workspaces (
  code TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许读写工作区"
  ON workspaces FOR ALL
  USING (true)
  WITH CHECK (true);
