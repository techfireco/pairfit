import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './src/components/Header';
import UpgradeModal from './src/components/UpgradeModal';
import AuthScreen from './src/screens/AuthScreen';
import ClosetScreen from './src/screens/ClosetScreen';
import StyleScreen from './src/screens/StyleScreen';
import {
  initSupabase,
  getSupabase,
  getMe,
  getItems,
  setOnSessionExpired,
} from './src/services/api';
import { theme } from './src/styles/theme';

export default function App() {
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState('');
  const [session, setSession] = useState(null);
  const [currentTab, setCurrentTab] = useState('closet'); // 'closet' | 'style'
  const [closet, setCloset] = useState([]);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

  // Initialize Supabase & Session
  useEffect(() => {
    let authListener = null;

    async function bootstrap() {
      try {
        const sb = await initSupabase();

        setOnSessionExpired(() => {
          setSession(null);
          setCloset([]);
          setProfile(null);
        });

        // Check active session
        const { data: { session: existingSession } } = await sb.auth.getSession();
        setSession(existingSession);

        // Listen for auth state changes
        const { data: listener } = sb.auth.onAuthStateChange((_event, currentSession) => {
          setSession(currentSession);
          if (!currentSession) {
            setCloset([]);
            setProfile(null);
          }
        });
        authListener = listener;
      } catch (err) {
        console.error('Bootstrap failed:', err);
        setInitError(err.message || 'Could not connect to PairFit API');
      } finally {
        setInitLoading(false);
      }
    }

    bootstrap();

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Fetch wardrobe data when logged in
  const loadWardrobeData = useCallback(async () => {
    if (!session) return;
    try {
      const [itemsData, profileData] = await Promise.all([
        getItems().catch(() => []),
        getMe().catch(() => null),
      ]);
      setCloset(itemsData || []);
      setProfile(profileData);
    } catch (err) {
      console.warn('Failed to load wardrobe data:', err);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadWardrobeData();
    }
  }, [session, loadWardrobeData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWardrobeData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      const sb = await getSupabase();
      await sb.auth.signOut();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setSession(null);
    setCloset([]);
    setProfile(null);
  };

  const handleItemAdded = (newItem) => {
    setCloset((prev) => [newItem, ...prev]);
    if (profile) {
      setProfile((prev) => ({
        ...prev,
        itemCount: (prev.itemCount || 0) + 1,
      }));
    }
  };

  const handleItemDeleted = (id) => {
    setCloset((prev) => prev.filter((item) => item.id !== id));
    if (profile) {
      setProfile((prev) => ({
        ...prev,
        itemCount: Math.max(0, (prev.itemCount || 1) - 1),
      }));
    }
  };

  // Splash Loading
  if (initLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.brandSplashIcon}>
          <Ionicons name="shirt" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.splashTitle}>PairFit</Text>
        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
        <Text style={styles.splashStatus}>Connecting to wardrobe engine…</Text>
      </SafeAreaView>
    );
  }

  // Connection Error
  if (initError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.danger} />
        <Text style={styles.errorTitle}>Connection Failed</Text>
        <Text style={styles.errorDescription}>{initError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setInitError('');
            setInitLoading(true);
            initSupabase()
              .then(() => setInitLoading(false))
              .catch((e) => {
                setInitError(e.message);
                setInitLoading(false);
              });
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Auth Screen if unauthenticated
  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <AuthScreen onAuthSuccess={() => {}} />
      </SafeAreaView>
    );
  }

  // Authenticated App Shell
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <Header user={session.user} onLogout={handleLogout} />

      <View style={styles.mainContent}>
        {currentTab === 'closet' ? (
          <ClosetScreen
            closet={closet}
            profile={profile}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onItemAdded={handleItemAdded}
            onItemDeleted={handleItemDeleted}
            onShowUpgradeModal={() => setUpgradeModalVisible(true)}
          />
        ) : (
          <StyleScreen
            closet={closet}
            onSwitchToCloset={() => setCurrentTab('closet')}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab('closet')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={currentTab === 'closet' ? 'shirt' : 'shirt-outline'}
            size={22}
            color={currentTab === 'closet' ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'closet' && styles.tabLabelActive,
            ]}
          >
            My Closet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab('style')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={currentTab === 'style' ? 'sparkles' : 'sparkles-outline'}
            size={22}
            color={currentTab === 'style' ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'style' && styles.tabLabelActive,
            ]}
          >
            Style This
          </Text>
        </TouchableOpacity>
      </View>

      {/* Freemium Limit Upgrade Modal */}
      <UpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.card,
  },
  mainContent: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandSplashIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...theme.shadows.md,
  },
  splashTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  splashStatus: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 10,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 280,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
