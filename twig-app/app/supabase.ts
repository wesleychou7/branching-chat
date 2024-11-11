import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qrpwsmzxaxksgvkvmxwv.supabase.co'
// const supabaseKey = process.env.SUPABASE_KEY || ''
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycHdzbXp4YXhrc2d2a3ZteHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwOTA1MjYsImV4cCI6MjA0NjY2NjUyNn0.LJd2-daGnChGMgoX6dC2R9SJDbf59pbNtXEhTUhjY9Y'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;