import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qucsourpednssdmakokz.supabase.co'
// const supabaseKey = process.env.SUPABASE_KEY || ''
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1Y3NvdXJwZWRuc3NkbWFrb2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxODM5NzQsImV4cCI6MjA0NDc1OTk3NH0.OiWSRCHDZHwq0Zl56x1Pmk9sptoZPIAFqUXmnRWB5bA'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;