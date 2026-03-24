import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ActivityLog {
  id: string;
  user_id: string;
  batch_log_id: string | null;
  entity_id: string;
  entity_type: 'competitor' | 'prospect' | 'client' | 'primary';
  entity_name: string | null;
  entity_domain: string | null;
  trigger_type: 'manual' | 'automatic' | 'manual_single';
  update_type: 'full' | 'content_news' | 'news_only';
  status: 'pending' | 'running' | 'success' | 'failed' | 'timeout';
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  error_message: string | null;
  created_at: string | null;
  user_name?: string | null;
}

export interface LogFilters {
  entityType?: string;
  updateType?: string;
  triggerType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface LogStats {
  total: number;
  success: number;
  failed: number;
  avgDuration: number;
  byEntityType: Record<string, number>;
  byUpdateType: Record<string, number>;
}

export const useActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<LogStats | null>(null);
  const pageSize = 20;

  const loadLogs = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Fetch individual activity logs
      let activityQuery = supabase
        .from('analysis_activity_log')
        .select('*');

      // 2. Fetch batch update logs
      let updateQuery = supabase
        .from('update_logs')
        .select('*');

      // Apply initial filters to both where applicable
      if (filters.startDate) {
        activityQuery = activityQuery.gte('created_at', filters.startDate.toISOString());
        updateQuery = updateQuery.gte('started_at', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        activityQuery = activityQuery.lte('created_at', filters.endDate.toISOString());
        updateQuery = updateQuery.lte('started_at', filters.endDate.toISOString());
      }

      const [activityRes, updateRes] = await Promise.all([activityQuery, updateQuery]);

      if (activityRes.error) throw activityRes.error;
      if (updateRes.error) throw updateRes.error;

      // Collect unique user IDs to fetch profiles separately
      const allFetchedLogs = [...(activityRes.data || []), ...(updateRes.data || [])];
      const uniqueUserIds = [...new Set(allFetchedLogs.map(log => log.user_id).filter(Boolean))];
      
      let profilesMap: Record<string, string> = {};
      if (uniqueUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', uniqueUserIds);
          
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.user_id] = profile.full_name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Map update logs to ActivityLog format
      const mappedUpdateLogs: ActivityLog[] = (updateRes.data || []).map(log => ({
        id: log.id,
        user_id: log.user_id,
        batch_log_id: null,
        entity_id: 'batch', // Identifier for batch logs
        entity_type: (log.entity_types?.[0] as any) || 'competitor', 
        entity_name: log.entity_types?.length > 1 
          ? `${log.entity_types.length} Entidades` 
          : (log.entity_types?.[0] === 'competitor' ? 'Concorrentes' : log.entity_types?.[0] === 'prospect' ? 'Prospects' : 'Clientes'),
        entity_domain: null,
        trigger_type: 'manual', // or check if it was automatic
        update_type: (log.update_type as any) || 'full',
        status: (log.status === 'completed' ? 'success' : log.status) as any,
        started_at: log.started_at,
        completed_at: log.completed_at,
        duration_seconds: log.completed_at 
          ? Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)
          : null,
        error_message: log.error_message,
        created_at: log.started_at,
        user_name: profilesMap[log.user_id] || null
      }));

      // Map activity logs to include user_name
      const mappedActivityLogs: ActivityLog[] = (activityRes.data || []).map((log: any) => ({
        ...log,
        user_name: profilesMap[log.user_id] || null
      }));

      // Combine and filter
      let allLogs = [...mappedActivityLogs, ...mappedUpdateLogs];

      // Apply remaining filters
      if (filters.entityType && filters.entityType !== 'all') {
        allLogs = allLogs.filter(l => l.entity_type === filters.entityType);
      }
      if (filters.updateType && filters.updateType !== 'all') {
        allLogs = allLogs.filter(l => l.update_type === filters.updateType);
      }
      if (filters.triggerType && filters.triggerType !== 'all') {
        allLogs = allLogs.filter(l => l.trigger_type === filters.triggerType);
      }
      if (filters.status && filters.status !== 'all') {
        allLogs = allLogs.filter(l => l.status === filters.status);
      }

      // Sort by created_at descending
      allLogs.sort((a, b) => {
        const dateA = new Date(a.created_at || a.started_at || 0).getTime();
        const dateB = new Date(b.created_at || b.started_at || 0).getTime();
        return dateB - dateA;
      });

      // Pagination matching total count
      const totalCount = allLogs.length;
      setTotalPages(Math.ceil(totalCount / pageSize));
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      setLogs(allLogs.slice(from, to) as ActivityLog[]);

    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filters, page]);

  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      // For stats, we repeat the logic to get all logs without pagination
      // (This could be optimized by using the combined list from loadLogs if they weren't separate requests)
      let activityQuery = supabase
        .from('analysis_activity_log')
        .select('*');

      let updateQuery = supabase
        .from('update_logs')
        .select('*');

      if (filters.startDate) {
        activityQuery = activityQuery.gte('created_at', filters.startDate.toISOString());
        updateQuery = updateQuery.gte('started_at', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        activityQuery = activityQuery.lte('created_at', filters.endDate.toISOString());
        updateQuery = updateQuery.lte('started_at', filters.endDate.toISOString());
      }

      const [activityRes, updateRes] = await Promise.all([activityQuery, updateQuery]);

      if (activityRes.error || updateRes.error) throw activityRes.error || updateRes.error;

      const mappedUpdateLogs = (updateRes.data || []).map(log => ({
        ...log,
        status: (log.status === 'completed' ? 'success' : log.status),
        duration_seconds: log.completed_at 
          ? Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)
          : null,
        entity_type: log.entity_types?.[0] || 'competitor',
        update_type: log.update_type || 'full'
      }));

      const allLogs = [...(activityRes.data || []), ...mappedUpdateLogs];

      // Calculate stats
      const successLogs = allLogs.filter(l => l.status === 'success' || l.status === 'completed');
      const failedLogs = allLogs.filter(l => l.status === 'failed' || l.status === 'timeout');
      const logsWithDuration = allLogs.filter(l => l.duration_seconds !== null);
      
      const avgDuration = logsWithDuration.length > 0
        ? logsWithDuration.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) / logsWithDuration.length
        : 0;

      const byEntityType: Record<string, number> = {};
      const byUpdateType: Record<string, number> = {};

      allLogs.forEach(log => {
        const et = log.entity_type || 'competitor';
        const ut = log.update_type || 'full';
        byEntityType[et] = (byEntityType[et] || 0) + 1;
        byUpdateType[ut] = (byUpdateType[ut] || 0) + 1;
      });

      setStats({
        total: allLogs.length,
        success: successLogs.length,
        failed: failedLogs.length,
        avgDuration: Math.round(avgDuration),
        byEntityType,
        byUpdateType
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [user, filters.startDate, filters.endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const clearAllLogs = useCallback(async () => {
    if (!user) return false;

    try {
      // Delete from analysis_activity_log
      const { error: activityError } = await supabase
        .from('analysis_activity_log')
        .delete()
        .eq('user_id', user.id);

      if (activityError) throw activityError;

      // Delete from update_logs
      const { error: updateError } = await supabase
        .from('update_logs')
        .delete()
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Refresh data
      setLogs([]);
      setStats({
        total: 0,
        success: 0,
        failed: 0,
        avgDuration: 0,
        byEntityType: {},
        byUpdateType: {}
      });
      setTotalPages(1);
      setPage(1);

      return true;
    } catch (error) {
      console.error('Error clearing logs:', error);
      return false;
    }
  }, [user]);

  return {
    logs,
    loading,
    filters,
    updateFilters,
    clearFilters,
    clearAllLogs,
    page,
    setPage,
    totalPages,
    stats,
    refresh: loadLogs
  };
};
