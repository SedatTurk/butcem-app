import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from '../../services/BudgetContext';
import { Colors, FontSize, BorderRadius, Spacing, Shadow } from '../../constants/theme';
import { generateInsights } from '../../services/AIEngine';

export default function AIScreen() {
  const { summary, expenses, incomes } = useBudget();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const insights = generateInsights(summary, expenses, incomes);

  const getTypeGradient = (type: string): [string, string] => {
    switch (type) {
      case 'warning': return ['rgba(255,61,110,0.12)', 'rgba(255,61,110,0.03)'];
      case 'saving': return ['rgba(139,92,246,0.12)', 'rgba(139,92,246,0.03)'];
      case 'achievement': return ['rgba(0,255,136,0.12)', 'rgba(0,255,136,0.03)'];
      case 'tip': return ['rgba(0,240,255,0.12)', 'rgba(0,240,255,0.03)'];
      default: return ['rgba(139,92,246,0.12)', 'rgba(139,92,246,0.03)'];
    }
  };

  const getTypeBorder = (type: string): string => {
    switch (type) {
      case 'warning': return Colors.danger + '30';
      case 'saving': return Colors.neonPurple + '30';
      case 'achievement': return Colors.neonGreen + '30';
      case 'tip': return Colors.neonCyan + '30';
      default: return Colors.neonPurple + '30';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'warning': return 'alert-circle';
      case 'saving': return 'cash-outline';
      case 'achievement': return 'trophy';
      case 'tip': return 'bulb-outline';
      default: return 'sparkles';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>AI Öneriler</Text>
            <Text style={styles.subtitle}>Yapay zeka destekli bütçe analizi</Text>
          </View>

          {/* AI Badge */}
          <LinearGradient
            colors={[Colors.gradientPurpleStart, '#4C1D95']}
            style={styles.aiBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.aiBannerDecor} />
            <View style={styles.aiBannerContent}>
              <View style={styles.aiIconBg}>
                <Ionicons name="sparkles" size={24} color={Colors.neonPurple} />
              </View>
              <View style={styles.aiBannerText}>
                <Text style={styles.aiBannerTitle}>BütçeM AI</Text>
                <Text style={styles.aiBannerSubtitle}>
                  {insights.length} öneri hazır
                </Text>
              </View>
            </View>
            <View style={styles.aiPulse}>
              <View style={styles.aiPulseDot} />
              <Text style={styles.aiPulseText}>Aktif</Text>
            </View>
          </LinearGradient>

          {/* Insights List */}
          {insights.map((insight, index) => (
            <Animated.View
              key={insight.id}
              style={[
                styles.insightCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20 * (index + 1), 0],
                    }),
                  }],
                },
              ]}
            >
              <LinearGradient
                colors={getTypeGradient(insight.type) as any}
                style={[styles.insightGradient, { borderColor: getTypeBorder(insight.type) }]}
              >
                <View style={styles.insightHeader}>
                  <View style={[styles.insightIconBg, { backgroundColor: insight.color + '20' }]}>
                    <Ionicons name={getTypeIcon(insight.type) as any} size={20} color={insight.color} />
                  </View>
                  <View style={[styles.insightBadge, { backgroundColor: insight.color + '20' }]}>
                    <Text style={[styles.insightBadgeText, { color: insight.color }]}>
                      {insight.type === 'warning' ? 'Uyarı'
                        : insight.type === 'saving' ? 'Tasarruf'
                        : insight.type === 'achievement' ? 'Başarı'
                        : 'İpucu'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDesc}>{insight.description}</Text>
                {insight.amount !== undefined && (
                  <View style={[styles.insightAmountBg, { backgroundColor: insight.color + '10' }]}>
                    <Ionicons name="cash-outline" size={16} color={insight.color} />
                    <Text style={[styles.insightAmount, { color: insight.color }]}>
                      ₺{insight.amount.toLocaleString('tr-TR')}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </Animated.View>
          ))}

          {insights.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Analiz Bekleniyor</Text>
              <Text style={styles.emptyText}>
                Gelir ve gider verilerinizi eklediğinizde AI motorumuz size öneriler sunacak.
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: 60 },
  header: { marginBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  aiBanner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Shadow.neonPurple,
  },
  aiBannerDecor: {
    position: 'absolute',
    top: -20, right: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  aiIconBg: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  aiBannerText: {},
  aiBannerTitle: {
    fontSize: FontSize.lg, fontWeight: '800', color: '#fff',
  },
  aiBannerSubtitle: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2,
  },
  aiPulse: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  aiPulseDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.neonGreen,
  },
  aiPulseText: {
    fontSize: FontSize.sm, color: Colors.neonGreen, fontWeight: '600',
  },
  insightCard: {
    marginBottom: Spacing.lg,
  },
  insightGradient: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  insightIconBg: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  insightBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  insightBadgeText: {
    fontSize: FontSize.xs, fontWeight: '700',
  },
  insightTitle: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  insightDesc: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    lineHeight: 22,
  },
  insightAmountBg: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  insightAmount: {
    fontSize: FontSize.md, fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center', paddingVertical: 60, gap: Spacing.md,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
});
