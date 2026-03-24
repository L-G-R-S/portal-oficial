import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";


interface ImageCacheRequest {
  posts: Array<{
    id: string;
    imageUrl: string;
    platform: 'linkedin' | 'instagram';
    entityType: 'company' | 'prospect' | 'client' | 'primary';
  }>;
}

interface CachedImageResult {
  postId: string;
  cachedUrl: string | null;
  error?: string;
}

async function downloadImage(url: string): Promise<ArrayBuffer | null> {
  try {
    // Try direct fetch first
    let response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      // Try with proxy
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=null`;
      response = await fetch(proxyUrl);
    }

    if (!response.ok) {
      console.error(`Failed to download image: ${url}, status: ${response.status}`);
      return null;
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return null;
  }
}

function getContentType(url: string): string {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes('.png')) return 'image/png';
  if (lowercaseUrl.includes('.gif')) return 'image/gif';
  if (lowercaseUrl.includes('.webp')) return 'image/webp';
  return 'image/jpeg'; // Default to jpeg
}

function getFileExtension(contentType: string): string {
  switch (contentType) {
    case 'image/png': return 'png';
    case 'image/gif': return 'gif';
    case 'image/webp': return 'webp';
    default: return 'jpg';
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { posts } = await req.json() as ImageCacheRequest;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No posts provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${posts.length} images for caching...`);

    const results: CachedImageResult[] = [];

    for (const post of posts) {
      const { id, imageUrl, platform, entityType } = post;

      if (!imageUrl || !id) {
        results.push({ postId: id, cachedUrl: null, error: 'Missing imageUrl or id' });
        continue;
      }

      try {
        // Download the image
        const imageData = await downloadImage(imageUrl);

        if (!imageData) {
          results.push({ postId: id, cachedUrl: null, error: 'Failed to download image' });
          continue;
        }

        // Determine content type and extension
        const contentType = getContentType(imageUrl);
        const extension = getFileExtension(contentType);

        // Generate unique path: platform/entityType/postId.ext
        const storagePath = `${platform}/${entityType}/${id}.${extension}`;

        // Upload to storage (upsert mode)
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(storagePath, imageData, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${id}:`, uploadError);
          results.push({ postId: id, cachedUrl: null, error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('post-media')
          .getPublicUrl(storagePath);

        const cachedUrl = urlData.publicUrl;
        results.push({ postId: id, cachedUrl });

        // Determine which table to update based on entityType and platform
        let tableName: string;
        let idColumn: string;

        if (entityType === 'primary') {
          tableName = platform === 'linkedin' 
            ? 'primary_company_linkedin_posts' 
            : 'primary_company_instagram_posts';
          idColumn = 'id';
        } else if (entityType === 'client') {
          tableName = platform === 'linkedin' 
            ? 'client_linkedin_posts' 
            : 'client_instagram_posts';
          idColumn = 'id';
        } else if (entityType === 'prospect') {
          tableName = platform === 'linkedin' 
            ? 'prospect_linkedin_posts' 
            : 'prospect_instagram_posts';
          idColumn = 'id';
        } else {
          // company (competitor)
          tableName = platform === 'linkedin' 
            ? 'linkedin_posts' 
            : 'instagram_posts';
          idColumn = 'id';
        }

        // Update the post record with cached URL
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ cached_thumbnail_url: cachedUrl })
          .eq(idColumn, id);

        if (updateError) {
          console.error(`Failed to update ${tableName} for id ${id}:`, updateError);
        } else {
          console.log(`Updated ${tableName} record ${id} with cached URL`);
        }

      } catch (error) {
        console.error(`Error processing post ${id}:`, error);
        results.push({ postId: id, cachedUrl: null, error: String(error) });
      }
    }

    console.log(`Cached ${results.filter(r => r.cachedUrl).length}/${posts.length} images successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        cached: results.filter(r => r.cachedUrl).length,
        failed: results.filter(r => !r.cachedUrl).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cache-post-images:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
