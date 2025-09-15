-- Create study_blocks table to store user's quiet study sessions
CREATE TABLE IF NOT EXISTS public.study_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_blocks
CREATE POLICY "Users can view their own study blocks" 
  ON public.study_blocks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study blocks" 
  ON public.study_blocks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study blocks" 
  ON public.study_blocks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study blocks" 
  ON public.study_blocks FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_study_blocks_user_id ON public.study_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_blocks_start_time ON public.study_blocks(start_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_study_blocks_updated_at 
  BEFORE UPDATE ON public.study_blocks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
