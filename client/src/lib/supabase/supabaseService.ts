// Where to function for CRUD function
import { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from './server'
import { Report } from '../../components/report/report-view'

// Pinky promise you return report or else its null
export async function getReport(id: string) {
    const supabase: SupabaseClient = createServerClient()
  
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('report_no', id)
      .single() // because you're expecting only one report
  
    if (error) {
      console.error('Get report error:', error)
      return null
    } else if (!data) {
        console.warn('No data was returned')
    } else {
        console.log('Got report:', data)
    }
  
    return data
  }