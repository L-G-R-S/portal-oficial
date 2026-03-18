import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Linkedin, Instagram, Youtube } from "lucide-react";
import SocialPostsGrid from "@/components/SocialPostsGrid";
import { SocialMetricsCards } from "@/components/competitor/SocialMetricsCards";

interface RedesSociaisTabProps {
  entity: any;
  socialPosts: {
    linkedin: any[];
    instagram: any[];
    youtube: any[];
  };
}

export function RedesSociaisTab({ entity, socialPosts }: RedesSociaisTabProps) {
  return (
    <>
      {/* Social Media Stats */}
      <SocialMetricsCards 
        linkedin={{ followers: entity.linkedin_followers }}
        instagram={{ 
          followers: entity.instagram_followers, 
          posts_count: entity.instagram_posts_count 
        }}
        youtube={{ 
          subscribers: entity.youtube_subscribers, 
          total_videos: entity.youtube_total_videos,
          total_views: entity.youtube_total_views
        }}
      />

      {/* Social Posts */}
      {(socialPosts.linkedin.length > 0 || socialPosts.instagram.length > 0 || socialPosts.youtube.length > 0) && (
        <Tabs defaultValue={socialPosts.linkedin.length > 0 ? "linkedin" : socialPosts.instagram.length > 0 ? "instagram" : "youtube"} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-12">
            <TabsTrigger 
              value="linkedin" 
              className="flex items-center justify-center gap-2 text-sm data-[state=active]:bg-background"
              disabled={socialPosts.linkedin.length === 0}
            >
              <Linkedin className="h-4 w-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </TabsTrigger>
            <TabsTrigger 
              value="instagram" 
              className="flex items-center justify-center gap-2 text-sm data-[state=active]:bg-background"
              disabled={socialPosts.instagram.length === 0}
            >
              <Instagram className="h-4 w-4" />
              <span className="hidden sm:inline">Instagram</span>
            </TabsTrigger>
            <TabsTrigger 
              value="youtube" 
              className="flex items-center justify-center gap-2 text-sm data-[state=active]:bg-background"
              disabled={socialPosts.youtube.length === 0}
            >
              <Youtube className="h-4 w-4" />
              <span className="hidden sm:inline">YouTube</span>
            </TabsTrigger>
          </TabsList>
          
          {socialPosts.linkedin.length > 0 && (
            <TabsContent value="linkedin" className="mt-4">
              <SocialPostsGrid posts={socialPosts.linkedin} type="linkedin" />
            </TabsContent>
          )}
          {socialPosts.instagram.length > 0 && (
            <TabsContent value="instagram" className="mt-4">
              <SocialPostsGrid posts={socialPosts.instagram} type="instagram" />
            </TabsContent>
          )}
          {socialPosts.youtube.length > 0 && (
            <TabsContent value="youtube" className="mt-4">
              <SocialPostsGrid posts={socialPosts.youtube} type="youtube" />
            </TabsContent>
          )}
        </Tabs>
      )}
    </>
  );
}