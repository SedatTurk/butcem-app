import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions, Animated, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { useBudget } from '../../services/BudgetContext';
import { Colors, FontSize, BorderRadius, Spacing, Shadow, CategoryIcons } from '../../constants/theme';
import { formatCurrency, getBudgetHealthColor } from '../../services/AIEngine';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const { summary, expenses, incomes, getUpcomingPayments } = useBudget();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const upcomingPayments = getUpcomingPayments();
  const healthColor = getBudgetHealthColor(summary.savingsRate);

  const balancePercentage = summary.totalIncome > 0
    ? Math.max(0, Math.min(100, (summary.balance / summary.totalIncome) * 100))
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Merhaba,</Text>
              <Text style={styles.userName}>{user?.name || 'Kullanıcı'} 👋</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.healthBadge, { borderColor: healthColor }]}>
                <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
                <Text style={[styles.healthText, { color: healthColor }]}>
                  {summary.savingsRate >= 20 ? 'İyi' : summary.savingsRate >= 10 ? 'Orta' : 'Düşük'}
                </Text>
              </View>
            </View>
          </View>

          {/* Main Balance Card */}
          <LinearGradient
            colors={[Colors.gradientPurpleStart, '#4C1D95', Colors.gradientPurpleEnd]}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceCardInner}>
              {/* Decorative circles */}
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />

              <Text style={styles.balanceLabel}>Kalan Bakiye</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(summary.balance, user?.currency)}
              </Text>

              <View style={styles.balanceProgressBg}>
                <Animated.View
                  style={[
                    styles.balanceProgressFill,
                    { width: `${balancePercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.balanceSubtext}>
                Gelirinizin %{balancePercentage.toFixed(0)}'i kaldı
              </Text>

              <View style={styles.balanceRow}>
                <View style={styles.balanceStat}>
                  <View style={styles.statIconBg}>
                    <Ionicons name="arrow-up" size={16} color={Colors.success} />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Gelir</Text>
                    <Text style={styles.statAmount}>
                      {formatCurrency(summary.totalIncome, user?.currency)}
                    </Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.balanceStat}>
                  <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,61,110,0.2)' }]}>
                    <Ionicons name="arrow-down" size={16} color={Colors.danger} />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Gider</Text>
                    <Text style={styles.statAmount}>
                      {formatCurrency(summary.totalExpenses, user?.currency)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatCard}>
              <LinearGradient
                colors={['rgba(0,240,255,0.15)', 'rgba(0,240,255,0.05)']}
                style={styles.quickStatGradient}
              >
                <Ionicons name="receipt-outline" size={22} color={Colors.neonCyan} />
                <Text style={styles.quickStatValue}>{expenses.length}</Text>
                <Text style={styles.quickStatLabel}>İşlem</Text>
              </LinearGradient>
            </View>
            <View style={styles.quickStatCard}>
              <LinearGradient
                colors={['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)']}
                style={styles.quickStatGradient}
              >
                <Ionicons name="layers-outline" size={22} color={Colors.neonPurple} />
                <Text style={styles.quickStatValue}>
                  {summary.categoryBreakdown.length}
                </Text>
                <Text style={styles.quickStatLabel}>Kategori</Text>
              </LinearGradient>
            </View>
            <View style={styles.quickStatCard}>
              <LinearGradient
                colors={['rgba(0,255,136,0.15)', 'rgba(0,255,136,0.05)']}
                style={styles.quickStatGradient}
              >
                <Ionicons name="trending-up-outline" size={22} color={Colors.neonGreen} />
                <Text style={styles.quickStatValue}>
                  %{Math.max(0, summary.savingsRate).toFixed(0)}
                </Text>
                <Text style={styles.quickStatLabel}>Tasarruf</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Category Breakdown */}
          {summary.categoryBreakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Harcama Dağılımı</Text>
              <View style={styles.categoryCard}>
                {summary.categoryBreakdown.slice(0, 5).map((cat, idx) => {
                  const catInfo = CategoryIcons[cat.category] || { icon: 'ellipsis-horizontal', color: Colors.neonPurple, label: cat.category };
                  return (
                    <View key={cat.category} style={styles.categoryRow}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.categoryIconBg, { backgroundColor: catInfo.color + '20' }]}>
                          <Ionicons name={catInfo.icon as any} size={18} color={catInfo.color} />
                        </View>
                        <View>
                          <Text style={styles.categoryName}>{catInfo.label}</Text>
                          <Text style={styles.categoryAmount}>
                            {formatCurrency(cat.amount, user?.currency)}/ay
                          </Text>
                        </View>
                      </View>
                      <View style={styles.categoryRight}>
                        <View style={styles.categoryBarBg}>
                          <View
                            style={[
                              styles.categoryBarFill,
                              { width: `${cat.percentage}%`, backgroundColor: catInfo.color },
                            ]}
                          />
                        </View>
                        <Text style={[styles.categoryPercent, { color: catInfo.color }]}>
                          %{cat.percentage.toFixed(0)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Upcoming Payments */}
          {upcomingPayments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Yaklaşan Ödemeler</Text>
              {upcomingPayments.map(payment => {
                const catInfo = CategoryIcons[payment.category] || { icon: 'cash', color: Colors.neonPurple, label: payment.category };
                const dueDate = new Date(payment.dueDate!);
                const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <View key={payment.id} style={styles.paymentCard}>
                    <View style={[styles.paymentIcon, { backgroundColor: catInfo.color + '20' }]}>
                      <Ionicons name={catInfo.icon as any} size={20} color={catInfo.color} />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentTitle}>{payment.title}</Text>
                      <Text style={styles.paymentDate}>
                        {daysLeft === 0 ? 'Bugün' : daysLeft === 1 ? 'Yarın' : `${daysLeft} gün sonra`}
                      </Text>
                    </View>
                    <Text style={[styles.paymentAmount, { color: Colors.danger }]}>
                      -{formatCurrency(payment.amount, user?.currency)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Empty State */}
          {expenses.length === 0 && incomes.length === 0 && (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={[Colors.cardBg, Colors.cardBgLight]}
                style={styles.emptyCard}
              >
                <Ionicons name="rocket-outline" size={48} color={Colors.neonPurple} />
                <Text style={styles.emptyTitle}>Başlayalım!</Text>
                <Text style={styles.emptyText}>
                  Gelir ve giderlerinizi ekleyerek bütçe takibinize başlayın. AI motorumuz size kişiselleştirilmiş öneriler sunacak.
                </Text>
              </LinearGradient>
            </View>
          )}

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  balanceCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    ...Shadow.neonPurple,
  },
  balanceCardInner: {
    padding: Spacing.xxl,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  balanceLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: FontSize.display,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  balanceProgressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    marginTop: Spacing.lg,
    overflow: 'hidden',
  },
  balanceProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  balanceSubtext: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: Spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  balanceStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0,255,136,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  statAmount: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#fff',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: Spacing.md,
  },
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  quickStatCard: {
    flex: 1,
  },
  quickStatGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickStatValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  quickStatLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  categoryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryAmount: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryBarBg: {
    width: 60,
    height: 6,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryPercent: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paymentDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  paymentAmount: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  emptyState: {
    marginTop: Spacing.xl,
  },
  emptyCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 22,
  },
});
