import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import { setCompletedOnboarding } from '../services/storage';
import { theme } from '../styles/theme';

const SLIDES = [
  {
    id: '1',
    icon: 'camera-outline',
    title: 'Your Digital Wardrobe',
    subtitle: 'Upload photos of your clothes. They are safely organized and stored in your private cloud account.',
  },
  {
    id: '2',
    icon: 'color-palette-outline',
    title: 'Color-Theory Matching',
    subtitle: 'Tap any clothing item to get instant, ranked pairings based on complementary, neutral, and monochrome color rules.',
  },
  {
    id: '3',
    icon: 'sparkles-outline',
    title: 'Dress with Confidence',
    subtitle: 'Every match comes with a color score (0–99) and plain-English reasons so you always know what goes with what.',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { width } = useWindowDimensions();

  const handleComplete = async () => {
    await setCompletedOnboarding(true);
    onFinish();
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Ionicons name="shirt" size={20} color={theme.colors.primary} />
          <Text style={styles.logoText}>PairFit</Text>
        </View>
        <TouchableOpacity onPress={handleComplete} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.card,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: theme.typography.md.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
  },
  skipBtn: {
    padding: theme.spacing[2],
  },
  skipText: {
    fontSize: theme.typography.sm.fontSize,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[8],
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[6],
    ...theme.shadows.sm,
  },
  title: {
    fontSize: theme.typography['2xl'].fontSize,
    fontWeight: '900',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: theme.spacing[3],
  },
  subtitle: {
    fontSize: theme.typography.base.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  bottomBar: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[6],
    gap: theme.spacing[6],
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  actionBtn: {
    width: '100%',
  },
});
