// ─────────────────────────────────────────────
// KEEPER — Tab Navigation Layout
// The bottom navigation bar with 4 tabs.
// ─────────────────────────────────────────────
import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { Colors, FontSize } from '@/constants/theme';
import { useAppStore, selectNewIssueCount } from '@/store/useAppStore';

// ── Custom Tab Icon ───────────────────────────
function TabIcon({
  name,
  focused,
  badge,
}: {
  name:    string;
  focused: boolean;
  badge?:  number;
}) {
  // Simple text-based icons (no icon library needed for scaffold)
  const icons: Record<string, { active: string; inactive: string }> = {
    home:     { active: '⌂',  inactive: '⌂' },
    issues:   { active: '!',  inactive: '!' },
    history:  { active: '↑',  inactive: '↑' },
    settings: { active: '⚙',  inactive: '⚙' },
  };

  const icon = icons[name] ?? { active: '•', inactive: '•' };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text
        style={{
          fontSize: 20,
          color:    focused ? Colors.emerald : Colors.textTertiary,
        }}
      >
        {focused ? icon.active : icon.inactive}
      </Text>
      {badge !== undefined && badge > 0 && (
        <View
          style={{
            position:        'absolute',
            top:             -4,
            right:           -8,
            backgroundColor: Colors.error,
            borderRadius:    10,
            minWidth:        18,
            height:          18,
            alignItems:      'center',
            justifyContent:  'center',
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ color: Colors.white, fontSize: 10, fontWeight: '700' }}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const newIssueCount = useAppStore(selectNewIssueCount);

  return (
    <Tabs
      screenOptions={{
        headerShown:     false,
        tabBarStyle:     {
          backgroundColor:  Colors.white,
          borderTopColor:   Colors.border,
          borderTopWidth:   1,
          height:           Platform.OS === 'ios' ? 84 : 64,
          paddingBottom:    Platform.OS === 'ios' ? 24 : 8,
          paddingTop:       8,
        },
        tabBarActiveTintColor:   Colors.emerald,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: '600',
          marginTop:  2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:    'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="issues"
        options={{
          title:    'Issues',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="issues" focused={focused} badge={newIssueCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title:    'History',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="history" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title:    'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
