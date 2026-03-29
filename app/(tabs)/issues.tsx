// ─────────────────────────────────────────────
// KEEPER — Issues Feed (Tab 2)
// Full list of every problem Keeper detected.
// Filterable by status. Tap any to see detail.
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IssueCard } from '@/components/issues/IssueCard';
import { IssueCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store/useAppStore';
import { useAnalysis } from '@/hooks/useAnalysis';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';
import type { IssueStatus } from '@/types';

type FilterTab = 'all' | IssueStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',         label: 'All'         },
  { key: 'new',         label: 'New'         },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved',    label: 'Resolved'    },
  { key: 'dismissed',   label: 'Dismissed'   },
];

export default function IssuesScreen() {
  const { issues, isAnalyzing } = useAppStore();
  const { runAnalysis }         = useAnalysis();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [refreshing,   setRefreshing]   = useState(false);

  const filteredIssues = activeFilter === 'all'
    ? issues
    : issues.filter((i) => i.status === activeFilter);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await runAnalysis();
    } finally {
      setRefreshing(false);
    }
  };

  // Count per filter
  const counts: Record<FilterTab, number> = {
    all:         issues.length,
    new:         issues.filter((i) => i.status === 'new').length,
    in_progress: issues.filter((i) => i.status === 'in_progress').length,
    resolved:    issues.filter((i) => i.status === 'resolved').length,
    dismissed:   issues.filter((i) => i.status === 'dismissed').length,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, color: Colors.navy }}>
          Issues
        </Text>
        <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 }}>
          {counts.new > 0
            ? `${counts.new} new issue${counts.new !== 1 ? 's' : ''} need your attention`
            : 'All caught up — Keeper is watching'}
        </Text>
      </View>

      {/* Filter tabs */}
      <View style={{ paddingLeft: 20, marginBottom: 16 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: 8, paddingRight: 20 }}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.key;
            const count    = counts[item.key];
            return (
              <TouchableOpacity
                onPress={() => setActiveFilter(item.key)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical:   8,
                  borderRadius:      BorderRadius.full,
                  backgroundColor:   isActive ? Colors.navy : Colors.white,
                  borderWidth:       1,
                  borderColor:       isActive ? Colors.navy : Colors.border,
                  flexDirection:     'row',
                  alignItems:        'center',
                  gap:               6,
                }}
              >
                <Text
                  style={{
                    fontSize:  FontSize.sm,
                    fontWeight: FontWeight.medium,
                    color:     isActive ? Colors.white : Colors.textSecondary,
                  }}
                >
                  {item.label}
                </Text>
                {count > 0 && (
                  <View
                    style={{
                      backgroundColor:   isActive ? 'rgba(255,255,255,0.25)' : Colors.surface,
                      borderRadius:      10,
                      paddingHorizontal: 6,
                      paddingVertical:   2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize:  10,
                        fontWeight: '700',
                        color:     isActive ? Colors.white : Colors.textSecondary,
                      }}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Issue list */}
      {isAnalyzing && filteredIssues.length === 0 ? (
        <View style={{ paddingHorizontal: 20, gap: 0 }}>
          {[1, 2, 3].map((i) => <IssueCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filteredIssues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <IssueCard issue={item} />}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom:     32,
            flexGrow:          1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.emerald}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={activeFilter === 'all' ? 'No issues found yet' : `No ${activeFilter.replace('_', ' ')} issues`}
              description={
                activeFilter === 'all'
                  ? 'Keeper scans daily. Connect a bank account to see your first results. Most users find $200–$400/month in hidden costs.'
                  : `You don't have any ${activeFilter.replace('_', ' ')} issues right now.`
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
