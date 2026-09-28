import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './src/components/Header';
import PaywallSheet from './src/components/PaywallSheet';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ClosetScreen from './src/screens/ClosetScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import StyleScreen from './src/screens/StyleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import {
  initSupabase,
  getSupabase,
  getMe,
  getItems,
  setOnSessionExpired,
} from './src/services/api';
import {
  getAuthToken,
  hasCompletedOnboarding,
  setCompletedOnboarding,
} from './src/services/storage';
import { theme } from './src/styles/theme';

export default function App() {
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState('');
  const [session, setSession] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  // Main navigation state: 'wardrobe' | 'add' | 'profile'
  const [currentTab, setCurrentTab] = useState('wardrobe');
  // 'style' mode item when user taps any garment in wardrobe
  const [selectedStyleItem, setSelectedStyleItem] = useState(null);

  // Wardrobe & user data
  const [closet, setCloset] = useState([]);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [closetLoading, setClosetLoading] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const authSubscriptionRef = useRef(null);

  // Bootstrap app: check onboarding status, initialize Supabase, check session
  const bootstrap = useCallback(async () => {
    setInitError('');
    setInitLoading(true);
    try {
      // 1. Check onboarding status flag
      const onboarded = await hasCompletedOnboarding();
      setHasSeenOnboarding(onboarded);

      // 2. Initialize Supabase client
      const sb = await initSupabase();

      setOnSessionExpired(() => {
        setSession(null);
        setCloset([]);
        setProfile(null);
        setSelectedStyleItem(null);
        setCurrentTab('wardrobe');
      });

      // 3. Check for active session
      const { data: { session: existingSession } } = await sb.auth.getSession();
      setSession(existingSession);

      // Clean up previous subscription if any
      if (authSubscriptionRef.current?.unsubscribe) {
        authSubscriptionRef.current.unsubscribe();
      }

      // 4. Register auth state listener
      const { data: listener } = sb.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
        if (!currentSession) {
          setCloset([]);
          setProfile(null);
          setSelectedStyleItem(null);
          setCurrentTab('wardrobe');
        }
      });
      authSubscriptionRef.current = listener?.subscription;
    } catch (err) {
      console.error('Bootstrap failed:', err);
      setInitError(err.message || 'Could not connect to PairFit API');
    } finally {
      setInitLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();

    return () => {
      if (authSubscriptionRef.current?.unsubscribe) {
        authSubscriptionRef.current.unsubscribe();
      }
    };
  }, [bootstrap]);

  // Load wardrobe & user profile
  const loadWardrobeData = useCallback(async () => {
    if (!session) return;
    try {
      setClosetLoading(true);
      const [itemsData, profileData] = await Promise.all([
        getItems().catch(() => []),
        getMe().catch(() => null),
      ]);
      setCloset(itemsData || []);
      setProfile(profileData);
    } catch (err) {
      console.warn('Failed to load wardrobe data:', err);
    } finally {
      setClosetLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadWardrobeData();
    }
  }, [session, loadWardrobeData]);

  // Handle Android hardware back button
  useEffect(() => {
    const handleBackPress = () => {
      if (paywallVisible) {
        setPaywallVisible(false);
        return true;
      }
      if (selectedStyleItem) {
        setSelectedStyleItem(null);
        return true;
      }
      if (currentTab !== 'wardrobe') {
        setCurrentTab('wardrobe');
        return true;
      }
      return false; // Exit app
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [paywallVisible, selectedStyleItem, currentTab]);

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
    setSelectedStyleItem(null);
    setCurrentTab('wardrobe');
  };

  const handleItemAdded = (newItem) => {
    setCloset((prev) => [newItem, ...prev]);
    if (profile) {
      setProfile((prev) => ({
        ...prev,
        itemCount: (prev.itemCount || 0) + 1,
      }));
    }
    setCurrentTab('wardrobe');
  };

  const handleItemDeleted = (id) => {
    setCloset((prev) => prev.filter((item) => item.id !== id));
    if (selectedStyleItem?.id === id) {
      setSelectedStyleItem(null);
    }
    if (profile) {
      setProfile((prev) => ({
        ...prev,
        itemCount: Math.max(0, (prev.itemCount || 1) - 1),
      }));
    }
  };

  const handleOnboardingFinish = async () => {
    await setCompletedOnboarding(true);
    setHasSeenOnboarding(true);
  };

  // 1. Splash Loading State
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

  // 2. Connection Error State
  if (initError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.danger} />
        <Text style={styles.errorTitle}>Connection Failed</Text>
        <Text style={styles.errorDescription}>{initError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={bootstrap} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 3. First-Launch Onboarding (if not completed and not logged in)
  if (!session && !hasSeenOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <OnboardingScreen onFinish={handleOnboardingFinish} />
      </SafeAreaView>
    );
  }

  // 4. Auth Screen if unauthenticated
  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <AuthScreen onAuthSuccess={() => {}} />
      </SafeAreaView>
    );
  }

  // 5. Authenticated App Shell with 3-tab navigation
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Show header on Wardrobe tab when not in Style mode */}
      {currentTab === 'wardrobe' && !selectedStyleItem && (
        <Header user={session.user} onLogout={handleLogout} />
      )}

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {selectedStyleItem ? (
          <StyleScreen
            item={selectedStyleItem}
            onBack={() => setSelectedStyleItem(null)}
            onOpenAddItem={() => {
              setSelectedStyleItem(null);
              setCurrentTab('add');
            }}
          />
        ) : currentTab === 'wardrobe' ? (
          <ClosetScreen
            closet={closet}
            profile={profile}
            loading={closetLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onItemDeleted={handleItemDeleted}
            onOpenAddItem={() => setCurrentTab('add')}
            onStyleItem={(item) => setSelectedStyleItem(item)}
          />
        ) : currentTab === 'add' ? (
          <AddItemScreen
            onItemAdded={handleItemAdded}
            onCancel={() => setCurrentTab('wardrobe')}
            onShowPaywall={() => setPaywallVisible(true)}
          />
        ) : (
          <ProfileScreen
            user={session.user}
            profile={profile}
            closet={closet}
            onLogout={handleLogout}
          />
        )}
      </View>

      {/* Exactly 3 Tabs: Wardrobe | Add (center) | Profile */}
      <View style={styles.tabBar}>
        {/* Tab 1: Wardrobe */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => {
            setSelectedStyleItem(null);
            setCurrentTab('wardrobe');
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={
              currentTab === 'wardrobe' && !selectedStyleItem
                ? 'shirt'
                : 'shirt-outline'
            }
            size={22}
            color={
              currentTab === 'wardrobe' && !selectedStyleItem
                ? theme.colors.primary
                : theme.colors.textMuted
            }
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'wardrobe' && !selectedStyleItem && styles.tabLabelActive,
            ]}
          >
            Wardrobe
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Add (Center Action) */}
        <TouchableOpacity
          style={styles.centerAddButton}
          onPress={() => {
            setSelectedStyleItem(null);
            setCurrentTab('add');
          }}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.addIconCircle,
              currentTab === 'add' && styles.addIconCircleActive,
            ]}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'add' && styles.tabLabelActive,
            ]}
          >
            Add Item
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Profile */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => {
            setSelectedStyleItem(null);
            setCurrentTab('profile');
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={
              currentTab === 'profile' ? theme.colors.primary : theme.colors.textMuted
            }
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'profile' && styles.tabLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dismissible Paywall Bottom Sheet (30/30 items limit) */}
      <PaywallSheet
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
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
    padding: theme.spacing[6],
  },
  brandSplashIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
    ...theme.shadows.md,
  },
  splashTitle: {
    fontSize: theme.typography['2xl'].fontSize,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  splashStatus: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing[3],
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: theme.typography.lg.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  errorDescription: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing[5],
    maxWidth: 280,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.radius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sm.fontSize,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 70 : 64,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 10 : 4,
    paddingTop: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  centerAddButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  addIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    ...theme.shadows.md,
  },
  addIconCircleActive: {
    backgroundColor: theme.colors.primaryDark,
    transform: [{ scale: 1.05 }],
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
