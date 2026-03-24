import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts";


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('[check-auto-updates] Checking for pending automatic updates...')

    // Find users with enabled auto-updates where next_update_at has passed
    const { data: pendingUpdates, error: fetchError } = await supabase
      .from('update_settings')
      .select('*')
      .eq('is_enabled', true)
      .not('next_update_at', 'is', null)
      .lte('next_update_at', new Date().toISOString())

    if (fetchError) {
      console.error('[check-auto-updates] Error fetching pending updates:', fetchError)
      throw fetchError
    }

    if (!pendingUpdates || pendingUpdates.length === 0) {
      console.log('[check-auto-updates] No pending automatic updates found')
      return new Response(
        JSON.stringify({ message: 'No pending updates', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log(`[check-auto-updates] Found ${pendingUpdates.length} users with pending updates`)

    const results: { user_id: string; status: string; error?: string }[] = []

    for (const settings of pendingUpdates) {
      const userId = settings.user_id

      // Check if there's already an active update for this user
      const { data: activeLog } = await supabase
        .from('update_logs')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['pending', 'running', 'dispatched'])
        .limit(1)
        .maybeSingle()

      if (activeLog) {
        console.log(`[check-auto-updates] User ${userId} already has an active update, skipping`)
        results.push({ user_id: userId, status: 'skipped', error: 'Active update in progress' })
        continue
      }

      // Build entity types array
      const entityTypes: string[] = []
      if (settings.update_competitors) entityTypes.push('competitor')
      if (settings.update_prospects) entityTypes.push('prospect')
      if (settings.update_clients) entityTypes.push('client')

      if (entityTypes.length === 0) {
        console.log(`[check-auto-updates] User ${userId} has no entity types selected, skipping`)
        results.push({ user_id: userId, status: 'skipped', error: 'No entity types selected' })
        continue
      }

      // Create log entry
      const { data: logData, error: logError } = await supabase
        .from('update_logs')
        .insert({
          user_id: userId,
          status: 'pending',
          entity_types: entityTypes,
          update_type: settings.update_type || 'full'
        })
        .select()
        .single()

      if (logError) {
        console.error(`[check-auto-updates] Error creating log for user ${userId}:`, logError)
        results.push({ user_id: userId, status: 'error', error: logError.message })
        continue
      }

      console.log(`[check-auto-updates] Created log ${logData.id} for user ${userId}`)

      try {
        // Call batch-update-sync edge function
        const response = await fetch(`${supabaseUrl}/functions/v1/batch-update-sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            user_id: userId,
            entity_types: entityTypes,
            log_id: logData.id,
            update_type: settings.update_type || 'full'
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[check-auto-updates] batch-update-sync failed for user ${userId}:`, errorText)
          
          // Mark log as failed
          await supabase
            .from('update_logs')
            .update({ 
              status: 'failed', 
              error_message: `Edge function error: ${errorText}`,
              completed_at: new Date().toISOString()
            })
            .eq('id', logData.id)

          results.push({ user_id: userId, status: 'error', error: errorText })
        } else {
          console.log(`[check-auto-updates] Successfully triggered update for user ${userId}`)
          results.push({ user_id: userId, status: 'success' })
        }

      } catch (invokeError) {
        console.error(`[check-auto-updates] Error invoking batch-update-sync for user ${userId}:`, invokeError)
        
        // Mark log as failed
        await supabase
          .from('update_logs')
          .update({ 
            status: 'failed', 
            error_message: invokeError instanceof Error ? invokeError.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', logData.id)

        results.push({ user_id: userId, status: 'error', error: invokeError instanceof Error ? invokeError.message : 'Unknown error' })
      }
    }

    console.log(`[check-auto-updates] Completed. Results: ${JSON.stringify(results)}`)

    return new Response(
      JSON.stringify({ 
        message: 'Auto-update check completed',
        count: pendingUpdates.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('[check-auto-updates] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})