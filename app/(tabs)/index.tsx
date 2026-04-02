import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions, Animated, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { useBudget } from '../../services/BudgetContext';
import { Colors, FontSize, BorderRadius, Spacing, Shadow, CategoryIcons } from '../../constants/theme';
import { formatCurrency, getBudgetHealthColor, getFrequencyLabel } from '../../services/AIEngine';
import SwipeModal from '../../components/SwipeModal';

const { width } = Dimensions.get('window');

type DetailModal = 'transactions' | 'categories' | 'savings' | 'categoryDetail' | 'notifications' | null;

export default function DashboardScreen() {
  const { user } = useAuth();
  const { summary, expenses, incomes, getUpcomingPayments, getNotifications } = useBudget();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [activeModal, setActiveModal] = useState<DetailModal>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const upcomingPayments = getUpcomingPayments();
  const notifications = getNotifications();
  const healthColor = getBudgetHealthColor(summary.savingsRate);

  const balancePercentage = summary.totalIncome > 0
    ? Math.max(0, Math.min(100, (summary.balance / summary.totalIncome) * 100))
    : 0;

  // Giderleri tarih sırasıyla listele
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Seçili kategorideki harcamalar
  const categoryExpenses = selectedCategory
    ? expenses.filter(e => e.category === selectedCategory)
    : [];

  const openCategoryDetail = (cat: string) => {
    setSelectedCategory(cat);
    setActiveModal('categoryDetail');
  };

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
              <TouchableOpacity onPress={() => setActiveModal('notifications')} style={styles.bellBtn} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
                {notifications.length > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{notifications.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
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

          {/* Quick Stats - Now Tappable */}
          <View style={styles.quickStats}>
            <TouchableOpacity style={styles.quickStatCard} onPress={() => setActiveModal('transactions')} activeOpacity={0.7}>
              <LinearGradient
                colors={['rgba(0,240,255,0.15)', 'rgba(0,240,255,0.05)']}
                style={styles.quickStatGradient}
              >
                <Ionicons name="cart-outline" size={22} color={Colors.neonCyan} />
                <Text style={styles.quickStatValue}>{expenses.length}</Text>
                <Text style={styles.quickStatLabel}>Harcama</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={styles.quickStatArrow} />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickStatCard} onPress={() => setActiveModal('categories')} activeOpacity={0.7}>
              <LinearGradient
                colors={['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)']}
                style={styles.quickStatGradient}
              >
                <Ionicons name="layers-outline" size={22} color={Colors.neonPurple} />
                <Text style={styles.quickStatValue}>
                  {summary.categoryBreakdown.length + (incomes.length > 0 ? 1 : 0)}
                </Text>
                <Text style={styles.quickStatLabel}>Kategori</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={styles.quickStatArrow} />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickStatCard} onPress={() => setActiveModal('savings')} activeOpacity={0.7}>
              <LinearGradient
                colors={['rgba(0,255,136,0.15)', 'rgba(0,255,136,0.05)']}
                style={styles.quickStatGradient}
              >
                <Ionicons name="trending-up-outline" size={22} color={Colors.neonGreen} />
                <Text style={styles.quickStatValue}>
                  %{Math.max(0, summary.savingsRate).toFixed(0)}
                </Text>
                <Text style={styles.quickStatLabel}>Tasarruf</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={styles.quickStatArrow} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Category Breakdown - Now Tappable */}
          {summary.categoryBreakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Harcama Dağılımı</Text>
              <View style={styles.categoryCard}>
                {summary.categoryBreakdown.slice(0, 5).map((cat) => {
                  const catInfo = CategoryIcons[cat.category] || { icon: 'ellipsis-horizontal', color: Colors.neonPurple, label: cat.category };
                  return (
                    <TouchableOpacity
                      key={cat.category}
                      style={styles.categoryRow}
                      onPress={() => openCategoryDetail(cat.category)}
                      activeOpacity={0.6}
                    >
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
                        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                      </View>
                    </TouchableOpacity>
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

      {/* ===== MODALS ===== */}

      {/* Harcamalar Detay Modal */}
      <SwipeModal visible={activeModal === 'transactions'} onClose={() => setActiveModal(null)}>
        <View style={styles.modalHeaderRow}>
          <Ionicons name="cart-outline" size={26} color={Colors.neonCyan} />
          <Text style={[styles.modalTitle, { marginTop: 0 }]}>Harcamalar</Text>
        </View>
        <Text style={styles.modalSubtitle}>
          {expenses.length} gider kaydı • Toplam: {formatCurrency(summary.totalExpenses, user?.currency)}/ay
        </Text>
        {sortedExpenses.length === 0 ? (
          <View style={styles.modalEmpty}>
            <Ionicons name="cart-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.modalEmptyText}>Henüz harcama yok</Text>
          </View>
        ) : (
          sortedExpenses.map((expense) => {
            const catInfo = CategoryIcons[expense.category] || { icon: 'ellipsis-horizontal', color: Colors.neonPurple, label: expense.category };
            return (
              <View key={expense.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: catInfo.color + '20' }]}>
                  <Ionicons name={catInfo.icon as any} size={18} color={catInfo.color} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{expense.title}</Text>
                  <Text style={styles.txMeta}>
                    {catInfo.label} • {getFrequencyLabel(expense.frequency)}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color: Colors.danger }]}>
                  -{formatCurrency(expense.amount, user?.currency)}
                </Text>
              </View>
            );
          })
        )}
      </SwipeModal>

      {/* Kategori Özet Modal */}
      <SwipeModal visible={activeModal === 'categories'} onClose={() => setActiveModal(null)}>
        <View style={styles.modalHeaderRow}>
          <Ionicons name="layers-outline" size={26} color={Colors.neonPurple} />
          <Text style={[styles.modalTitle, { marginTop: 0 }]}>Kategori Dağılımı</Text>
        </View>
        <Text style={styles.modalSubtitle}>
          {summary.categoryBreakdown.length} gider + {incomes.length > 0 ? '1 gelir' : '0 gelir'} kategorisi
        </Text>

        {/* Gelir Bölümü */}
        {incomes.length > 0 && (
          <>
            <Text style={styles.catSectionLabel}>💚 Gelirler</Text>
            <View style={styles.catSectionCard}>
              {incomes.map((income) => (
                <View key={income.id} style={styles.txRow}>
                  <View style={[styles.txIcon, { backgroundColor: Colors.neonGreen + '20' }]}>
                    <Ionicons name="arrow-up" size={18} color={Colors.neonGreen} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{income.title}</Text>
                    <Text style={styles.txMeta}>{getFrequencyLabel(income.frequency)}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: Colors.neonGreen }]}>
                    +{formatCurrency(income.amount, user?.currency)}
                  </Text>
                </View>
              ))}
              <View style={styles.catSectionTotal}>
                <Text style={styles.catSectionTotalLabel}>Toplam Gelir</Text>
                <Text style={[styles.catSectionTotalValue, { color: Colors.neonGreen }]}>
                  {formatCurrency(summary.totalIncome, user?.currency)}/ay
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Gider Bölümü */}
        <Text style={styles.catSectionLabel}>🔴 Giderler (Kategoriler)</Text>
        {summary.categoryBreakdown.length === 0 ? (
          <View style={styles.modalEmpty}>
            <Ionicons name="layers-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.modalEmptyText}>Henüz harcama yok</Text>
          </View>
        ) : (
          <View style={styles.catSectionCard}>
            {summary.categoryBreakdown.map((cat) => {
              const catInfo = CategoryIcons[cat.category] || { icon: 'ellipsis-horizontal', color: Colors.neonPurple, label: cat.category };
              const catExpenses = expenses.filter(e => e.category === cat.category);
              return (
                <TouchableOpacity
                  key={cat.category}
                  style={styles.catDetailRow}
                  onPress={() => {
                    setActiveModal(null);
                    setTimeout(() => openCategoryDetail(cat.category), 300);
                  }}
                  activeOpacity={0.6}
                >
                  <View style={[styles.catDetailIcon, { backgroundColor: catInfo.color + '20' }]}>
                    <Ionicons name={catInfo.icon as any} size={20} color={catInfo.color} />
                  </View>
                  <View style={styles.catDetailInfo}>
                    <Text style={styles.catDetailName}>{catInfo.label}</Text>
                    <Text style={styles.catDetailMeta}>{catExpenses.length} harcama</Text>
                  </View>
                  <View style={styles.catDetailRight}>
                    <Text style={[styles.catDetailAmount, { color: catInfo.color }]}>
                      {formatCurrency(cat.amount, user?.currency)}
                    </Text>
                    <Text style={styles.catDetailPercent}>%{cat.percentage.toFixed(0)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            })}
            <View style={styles.catSectionTotal}>
              <Text style={styles.catSectionTotalLabel}>Toplam Gider</Text>
              <Text style={[styles.catSectionTotalValue, { color: Colors.danger }]}>
                {formatCurrency(summary.totalExpenses, user?.currency)}/ay
              </Text>
            </View>
          </View>
        )}
      </SwipeModal>

      {/* Tasarruf Detay Modal */}
      <SwipeModal visible={activeModal === 'savings'} onClose={() => setActiveModal(null)}>
        <View style={styles.modalHeaderRow}>
          <Ionicons name="trending-up-outline" size={26} color={Colors.neonGreen} />
          <Text style={[styles.modalTitle, { marginTop: 0 }]}>Tasarruf Analizi</Text>
        </View>

        <View style={styles.savingsCard}>
          <View style={styles.savingsRow}>
            <Text style={styles.savingsLabel}>Aylık Gelir</Text>
            <Text style={[styles.savingsValue, { color: Colors.neonGreen }]}>
              {formatCurrency(summary.totalIncome, user?.currency)}
            </Text>
          </View>
          <View style={styles.savingsDivider} />
          <View style={styles.savingsRow}>
            <Text style={styles.savingsLabel}>Aylık Gider</Text>
            <Text style={[styles.savingsValue, { color: Colors.danger }]}>
              -{formatCurrency(summary.totalExpenses, user?.currency)}
            </Text>
          </View>
          <View style={styles.savingsDivider} />
          <View style={styles.savingsRow}>
            <Text style={[styles.savingsLabel, { fontWeight: '700', color: Colors.textPrimary }]}>Kalan (Tasarruf)</Text>
            <Text style={[styles.savingsValue, { color: summary.balance >= 0 ? Colors.neonGreen : Colors.danger, fontWeight: '800' }]}>
              {formatCurrency(summary.balance, user?.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.savingsRateCard}>
          <View style={styles.savingsRateHeader}>
            <Text style={styles.savingsRateLabel}>Tasarruf Oranı</Text>
            <Text style={[styles.savingsRateValue, { color: healthColor }]}>
              %{Math.max(0, summary.savingsRate).toFixed(1)}
            </Text>
          </View>
          <View style={styles.savingsProgressBg}>
            <View style={[styles.savingsProgressFill, { width: `${Math.min(100, Math.max(0, summary.savingsRate))}%`, backgroundColor: healthColor }]} />
          </View>
          <View style={styles.savingsScaleRow}>
            <Text style={styles.savingsScaleText}>%0</Text>
            <Text style={[styles.savingsScaleText, { color: Colors.warning }]}>%10</Text>
            <Text style={[styles.savingsScaleText, { color: Colors.neonGreen }]}>%20+</Text>
          </View>
        </View>

        <View style={styles.savingsTipCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.neonCyan} />
          <Text style={styles.savingsTipText}>
            {summary.savingsRate >= 20
              ? 'Harika gidiyorsunuz! Tasarruf oranınız idealin üzerinde. Yatırım fırsatlarını değerlendirin.'
              : summary.savingsRate >= 10
              ? '50/30/20 kuralına göre gelirinizin en az %20\'sini biriktirmeyi hedefleyin.'
              : summary.totalIncome > 0
              ? 'Tasarruf oranınız düşük. Gereksiz harcamaları gözden geçirip azaltmayı deneyin.'
              : 'Gelir ve giderlerinizi ekleyerek tasarruf analizi alabilirsiniz.'
            }
          </Text>
        </View>
      </SwipeModal>

      {/* Kategori Detay Modal */}
      <SwipeModal visible={activeModal === 'categoryDetail'} onClose={() => { setActiveModal(null); setSelectedCategory(null); }}>
        {selectedCategory && (() => {
          const catInfo = CategoryIcons[selectedCategory] || { icon: 'ellipsis-horizontal', color: Colors.neonPurple, label: selectedCategory };
          const catSummary = summary.categoryBreakdown.find(c => c.category === selectedCategory);
          return (
            <>
              <View style={styles.catModalHeader}>
                <View style={[styles.catModalIconBg, { backgroundColor: catInfo.color + '20' }]}>
                  <Ionicons name={catInfo.icon as any} size={24} color={catInfo.color} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>{catInfo.label}</Text>
                  <Text style={styles.modalSubtitle}>
                    Toplam: {formatCurrency(catSummary?.amount || 0, user?.currency)}/ay • %{(catSummary?.percentage || 0).toFixed(0)}
                  </Text>
                </View>
              </View>

              {categoryExpenses.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>Bu kategoride harcama yok</Text>
                </View>
              ) : (
                categoryExpenses.map((expense) => (
                  <View key={expense.id} style={styles.txRow}>
                    <View style={[styles.txIcon, { backgroundColor: catInfo.color + '15' }]}>
                      <Ionicons name={catInfo.icon as any} size={16} color={catInfo.color} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txTitle}>{expense.title}</Text>
                      <Text style={styles.txMeta}>{getFrequencyLabel(expense.frequency)}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: Colors.danger }]}>
                      -{formatCurrency(expense.amount, user?.currency)}
                    </Text>
                  </View>
                ))
              )}
            </>
          );
        })()}
      </SwipeModal>
      {/* Bildirimler Modal */}
      <SwipeModal visible={activeModal === 'notifications'} onClose={() => setActiveModal(null)} maxHeightPercent={70}>
        <View style={styles.modalHeaderRow}>
          <Ionicons name="notifications-outline" size={26} color={Colors.neonOrange} />
          <Text style={[styles.modalTitle, { marginTop: 0 }]}>Bildirimler</Text>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.modalEmpty}>
            <Ionicons name="checkmark-circle-outline" size={48} color={Colors.neonGreen} />
            <Text style={styles.modalEmptyText}>Tüm ödemeleriniz yolunda, bildirim yok!</Text>
          </View>
        ) : (
          <View style={{ gap: Spacing.md, marginTop: Spacing.md }}>
            {notifications.map((notif, index) => {
              const isOverdue = notif.dueStatus === 'overdue';
              const isToday = notif.dueStatus === 'due_today';
              return (
                <View key={`${notif.id}-${index}`} style={[styles.catDetailRow, { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.md, borderBottomWidth: 0, borderWidth: 1, borderColor: isOverdue ? Colors.danger + '30' : Colors.border }]}>
                  <View style={[styles.txIcon, { backgroundColor: isOverdue ? Colors.danger + '20' : isToday ? Colors.neonOrange + '20' : Colors.neonCyan + '20' }]}>
                    <Ionicons name={isOverdue ? 'alert-circle' : isToday ? 'time' : 'calendar'} size={20} color={isOverdue ? Colors.danger : isToday ? Colors.neonOrange : Colors.neonCyan} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{notif.title}</Text>
                    <Text style={styles.txMeta}>
                      {isOverdue ? `Ödeme günü ${Math.abs(notif.diffDays)} gün geçti!` : isToday ? 'Son ödeme günü: Bugün' : `Ödemeye son ${notif.diffDays} gün kaldı`}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                     <Text style={[styles.txAmount, { color: isOverdue ? Colors.danger : Colors.textPrimary }]}>{formatCurrency(notif.amount, user?.currency)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </SwipeModal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greeting: { fontSize: FontSize.md, color: Colors.textSecondary },
  userName: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  bellBtn: {
    padding: 4, position: 'relative',
  },
  bellBadge: {
    position: 'absolute', top: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.danger,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  bellBadgeText: {
    fontSize: 9, fontWeight: '800', color: '#fff',
  },
  healthBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1, gap: 6,
  },
  healthDot: { width: 8, height: 8, borderRadius: 4 },
  healthText: { fontSize: FontSize.sm, fontWeight: '600' },
  balanceCard: {
    borderRadius: BorderRadius.xl, marginBottom: Spacing.xl,
    overflow: 'hidden', ...Shadow.neonPurple,
  },
  balanceCardInner: { padding: Spacing.xxl, overflow: 'hidden' },
  decorCircle1: {
    position: 'absolute', top: -30, right: -30, width: 120, height: 120,
    borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle2: {
    position: 'absolute', bottom: -20, left: -20, width: 80, height: 80,
    borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  balanceLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  balanceAmount: { fontSize: FontSize.display, fontWeight: '800', color: '#fff', marginTop: 4 },
  balanceProgressBg: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3, marginTop: Spacing.lg, overflow: 'hidden',
  },
  balanceProgressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  balanceSubtext: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: Spacing.sm },
  balanceRow: { flexDirection: 'row', marginTop: Spacing.xl, alignItems: 'center' },
  balanceStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  statIconBg: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(0,255,136,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  statLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  statAmount: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
  statDivider: {
    width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: Spacing.md,
  },
  quickStats: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl },
  quickStatCard: { flex: 1 },
  quickStatGradient: {
    padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center',
    gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  quickStatValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  quickStatLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  quickStatArrow: { marginTop: 2 },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  categoryIconBg: {
    width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  categoryName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  categoryAmount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  categoryRight: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  categoryBarBg: {
    width: 50, height: 6, backgroundColor: Colors.backgroundLight,
    borderRadius: 3, overflow: 'hidden',
  },
  categoryBarFill: { height: '100%', borderRadius: 3 },
  categoryPercent: { fontSize: FontSize.sm, fontWeight: '700', width: 45, textAlign: 'right' },
  paymentCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.md,
  },
  paymentIcon: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  paymentInfo: { flex: 1 },
  paymentTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  paymentDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  paymentAmount: { fontSize: FontSize.md, fontWeight: '700' },
  emptyState: { marginTop: Spacing.xl },
  emptyCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.xxxl, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.lg },
  emptyText: {
    fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center',
    marginTop: Spacing.md, lineHeight: 22,
  },

  // ===== Modal Styles =====
  modalHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.sm },
  modalSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg },
  modalEmpty: { alignItems: 'center', paddingVertical: 40, gap: Spacing.md },
  modalEmptyText: { fontSize: FontSize.md, color: Colors.textMuted },

  // Transaction rows
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border + '40',
  },
  txIcon: {
    width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  txInfo: { flex: 1 },
  txTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  txMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  txAmount: { fontSize: FontSize.md, fontWeight: '700' },

  // Category detail rows
  catDetailRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border + '40',
  },
  catDetailIcon: {
    width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  catDetailInfo: { flex: 1 },
  catDetailName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  catDetailMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  catDetailRight: { alignItems: 'flex-end', marginRight: 4 },
  catDetailAmount: { fontSize: FontSize.md, fontWeight: '700' },
  catDetailPercent: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  // Category modal header
  catModalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  catModalIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  // Savings modal
  savingsCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  savingsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  savingsLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  savingsValue: { fontSize: FontSize.md, fontWeight: '700' },
  savingsDivider: { height: 1, backgroundColor: Colors.border },
  savingsRateCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  savingsRateHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  savingsRateLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  savingsRateValue: { fontSize: FontSize.xxl, fontWeight: '800' },
  savingsProgressBg: {
    height: 8, backgroundColor: Colors.backgroundLight, borderRadius: 4, overflow: 'hidden',
  },
  savingsProgressFill: { height: '100%', borderRadius: 4 },
  savingsScaleRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm,
  },
  savingsScaleText: { fontSize: FontSize.xs, color: Colors.textMuted },
  savingsTipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.neonCyan + '10', borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.neonCyan + '20',
  },
  savingsTipText: {
    flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20,
  },

  // Category section styles
  catSectionLabel: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary,
    marginTop: Spacing.lg, marginBottom: Spacing.md,
  },
  catSectionCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  catSectionTotal: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Spacing.md, marginTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  catSectionTotalLabel: {
    fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary,
  },
  catSectionTotalValue: {
    fontSize: FontSize.md, fontWeight: '700',
  },
});
