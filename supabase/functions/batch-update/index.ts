import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts";


const WEBHOOK_URL = 'https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/oficial'
const BATCH_SIZE = 20

interface Entity {
  id: string
  domain: string
  name: string | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // ============ SECURITY: Validate JWT Authentication ============
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[batch-update] Missing or invalid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    // First validate the user's token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: authError } = await userClient.auth.getUser(token)
    
    if (authError || !userData.user) {
      console.error('[batch-update] Invalid token:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY: Extract user_id from JWT, NOT from request body
    const user_id = userData.user.id
    console.log(`[batch-update] Authenticated user: ${user_id}`)
    // ============ END SECURITY ============

    // Use service role for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Only extract entity_types and log_id from body (not user_id for security)
    const { entity_types, log_id } = await req.json()

    console.log(`[batch-update] Starting for user ${user_id}`)
    console.log(`[batch-update] Entity types: ${JSON.stringify(entity_types)}`)
    console.log(`[batch-update] Log ID: ${log_id}`)

    // Collect all entities to update
    const allEntities: { id: string; domain: string; name: string | null; entityType: string }[] = []

    // Fetch competitors
    if (entity_types.includes('competitor')) {
      const { data: competitors, error } = await supabase
        .from('companies')
        .select('id, domain, name')
      
      if (!error && competitors) {
        competitors.forEach((c: Entity) => {
          if (c.domain) {
            allEntities.push({ id: c.id, domain: c.domain, name: c.name, entityType: 'competitor' })
          }
        })
      }
      console.log(`[batch-update] Found ${competitors?.length || 0} competitors`)
    }

    // Fetch prospects
    if (entity_types.includes('prospect')) {
      const { data: prospects, error } = await supabase
        .from('prospects')
        .select('id, domain, name')
      
      if (!error && prospects) {
        prospects.forEach((p: Entity) => {
          if (p.domain) {
            allEntities.push({ id: p.id, domain: p.domain, name: p.name, entityType: 'prospect' })
          }
        })
      }
      console.log(`[batch-update] Found ${prospects?.length || 0} prospects`)
    }

    // Fetch clients
    if (entity_types.includes('client')) {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, domain, name')
      
      if (!error && clients) {
        clients.forEach((c: Entity) => {
          if (c.domain) {
            allEntities.push({ id: c.id, domain: c.domain, name: c.name, entityType: 'client' })
          }
        })
      }
      console.log(`[batch-update] Found ${clients?.length || 0} clients`)
    }

    console.log(`[batch-update] Total entities to update: ${allEntities.length}`)

    // Update log with total count and set status to running
    if (log_id) {
      const { error: logError } = await supabase
        .from('update_logs')
        .update({ 
          total_entities: allEntities.length,
          status: 'running'
        })
        .eq('id', log_id)
      
      if (logError) {
        console.error(`[batch-update] Error updating log status:`, logError)
      }
    }

    // Process entities - FIRE AND FORGET model
    let entitiesDispatched = 0

    for (let i = 0; i < allEntities.length; i += BATCH_SIZE) {
      const batch = allEntities.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(allEntities.length / BATCH_SIZE)
      
      console.log(`[batch-update] Processing batch ${batchNumber}/${totalBatches} (${batch.length} entities)`)

      for (const entity of batch) {
        // FIRE AND FORGET - dispatch webhook without waiting for response
        // Include log_id, user_id, and entity_type so process-company-data can close the loop
        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: entity.domain,
            entity_type: entity.entityType,
            log_id: log_id,
            user_id: user_id
          }),
        }).catch(err => {
          console.error(`[batch-update] Error dispatching webhook for ${entity.domain}:`, err)
        })

        entitiesDispatched++
        console.log(`[batch-update] Dispatched update for ${entity.domain} (${entity.entityType})`)
      }

      // Update progress in log
      if (log_id) {
        await supabase
          .from('update_logs')
          .update({ entities_updated: entitiesDispatched })
          .eq('id', log_id)
      }
    }

    // Mark as DISPATCHED (waiting for N8N to process) - NOT completed yet
    if (log_id) {
      const { error: dispatchError } = await supabase
        .from('update_logs')
        .update({ 
          status: 'dispatched',
          entities_updated: 0 // Reset to 0, will be incremented by process-company-data
        })
        .eq('id', log_id)
      
      if (dispatchError) {
        console.error(`[batch-update] Error updating log:`, dispatchError)
      } else {
        console.log(`[batch-update] Log marked as dispatched (waiting for N8N)`)
      }
    }

    // Create SINGLE summary notification - no individual notifications (reduced spam)
    const { error: summaryError } = await supabase
      .from('notifications')
      .insert({
        user_id: user_id,
        title: 'Atualização em lote iniciada',
        message: `${allEntities.length} ${allEntities.length === 1 ? 'entidade sendo atualizada' : 'entidades sendo atualizadas'}. Você será notificado quando concluir.`,
        type: 'info',
        action_url: '/settings',
        action_data: { log_id, total_entities: allEntities.length }
      })

    if (summaryError) {
      console.error(`[batch-update] Error creating summary notification:`, summaryError)
    } else {
      console.log(`[batch-update] Summary notification created`)
    }

    // Update settings with last update time and calculate next update
    const { data: settings } = await supabase
      .from('update_settings')
      .select('frequency_minutes')
      .eq('user_id', user_id)
      .single()

    if (settings) {
      const nextUpdate = new Date()
      nextUpdate.setMinutes(nextUpdate.getMinutes() + settings.frequency_minutes)

      await supabase
        .from('update_settings')
        .update({
          last_update_at: new Date().toISOString(),
          next_update_at: nextUpdate.toISOString()
        })
        .eq('user_id', user_id)
    }

    console.log(`[batch-update] Completed. Dispatched ${entitiesDispatched}/${allEntities.length} entities`)

    return new Response(
      JSON.stringify({
        success: true,
        total: allEntities.length,
        dispatched: entitiesDispatched
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('[batch-update] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})