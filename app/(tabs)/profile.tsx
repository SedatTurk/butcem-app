import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { useBudget } from '../../services/BudgetContext';
import { Colors, FontSize, BorderRadius, Spacing, Shadow } from '../../constants/theme';
import { formatCurrency } from '../../services/AIEngine';

const CURRENCIES = ['₺', '$', '€', '£'];

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { incomes, expenses, summary } = useBudget();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  const handleCurrencyChange = () => {
    const currentIndex = CURRENCIES.indexOf(user?.currency || '₺');
    const nextCurrency = CURRENCIES[(currentIndex + 1) % CURRENCIES.length];
    updateProfile({ currency: nextCurrency });
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
    : '';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profil</Text>
          </View>

          {/* User Card */}
          <LinearGradient
            colors={[Colors.cardBg, Colors.cardBgLight]}
            style={styles.userCard}
          >
            <LinearGradient
              colors={[Colors.gradientPurpleStart, Colors.neonPurple]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>
            <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            {memberSince ? (
              <View style={styles.memberBadge}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.memberText}>{memberSince}'dan beri üye</Text>
              </View>
            ) : null}
          </LinearGradient>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{incomes.length}</Text>
              <Text style={styles.statLabel}>Gelir Kaynağı</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{expenses.length}</Text>
              <Text style={styles.statLabel}>Gider Kalemi</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: summary.balance >= 0 ? Colors.neonGreen : Colors.danger }]}>
                {formatCurrency(Math.abs(summary.balance), user?.currency)}
              </Text>
              <Text style={styles.statLabel}>
                {summary.balance >= 0 ? 'Bakiye' : 'Açık'}
              </Text>
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ayarlar</Text>

            <TouchableOpacity style={styles.settingRow} onPress={handleCurrencyChange}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconBg, { backgroundColor: Colors.neonCyan + '20' }]}>
                  <Ionicons name="cash-outline" size={20} color={Colors.neonCyan} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Para Birimi</Text>
                  <Text style={styles.settingValue}>Değiştirmek için dokunun</Text>
                </View>
              </View>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyText}>{user?.currency || '₺'}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconBg, { backgroundColor: Colors.neonOrange + '20' }]}>
                  <Ionicons name="notifications-outline" size={20} color={Colors.neonOrange} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Bildirimler</Text>
                  <Text style={styles.settingValue}>Ödeme hatırlatmaları aktif</Text>
                </View>
              </View>
              <View style={[styles.toggleTrack, styles.toggleActive]}>
                <View style={[styles.toggleThumb, styles.toggleThumbActive]} />
              </View>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconBg, { backgroundColor: Colors.neonPurple + '20' }]}>
                  <Ionicons name="sparkles-outline" size={20} color={Colors.neonPurple} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>AI Öneriler</Text>
                  <Text style={styles.settingValue}>Kişiselleştirilmiş analiz aktif</Text>
                </View>
              </View>
              <View style={[styles.toggleTrack, styles.toggleActive]}>
                <View style={[styles.toggleThumb, styles.toggleThumbActive]} />
              </View>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uygulama</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconBg, { backgroundColor: Colors.textMuted + '20' }]}>
                  <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Sürüm</Text>
                  <Text style={styles.settingValue}>1.0.0</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
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
  userCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xxl,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.neonPurple,
  },
  avatarText: {
    fontSize: FontSize.xxxl, fontWeight: '800', color: '#fff',
  },
  userName: {
    fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs,
  },
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: Spacing.md,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundLight,
  },
  memberText: {
    fontSize: FontSize.sm, color: Colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1,
  },
  settingIconBg: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  settingLabel: {
    fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary,
  },
  settingValue: {
    fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2,
  },
  currencyBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.neonCyan + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  currencyText: {
    fontSize: FontSize.lg, fontWeight: '800', color: Colors.neonCyan,
  },
  toggleTrack: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: Colors.textMuted + '40',
    justifyContent: 'center', padding: 3,
  },
  toggleActive: {
    backgroundColor: Colors.neonGreen + '30',
  },
  toggleThumb: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.textMuted,
  },
  toggleThumbActive: {
    backgroundColor: Colors.neonGreen,
    alignSelf: 'flex-end',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.danger + '10',
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  logoutText: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.danger,
  },
});
