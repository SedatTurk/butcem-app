import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Modal, Alert, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { useBudget } from '../../services/BudgetContext';
import { Colors, FontSize, BorderRadius, Spacing, Shadow } from '../../constants/theme';
import { formatCurrency, getFrequencyLabel } from '../../services/AIEngine';

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'] as const;
const FREQ_LABELS: Record<string, string> = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  yearly: 'Yıllık',
};

export default function IncomeScreen() {
  const { user } = useAuth();
  const { incomes, addIncome, deleteIncome, updateIncome, summary } = useBudget();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<typeof FREQUENCIES[number]>('monthly');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }
    await addIncome({
      title: title.trim(),
      amount: numAmount,
      frequency,
      date: new Date().toISOString(),
      isActive: true,
    });
    setTitle('');
    setAmount('');
    setFrequency('monthly');
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Sil', `"${name}" gelir kaynağını silmek istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteIncome(id) },
    ]);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await updateIncome(id, { isActive: !isActive });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Gelirler</Text>
            <Text style={styles.subtitle}>Gelir kaynaklarınızı yönetin</Text>
          </View>

          {/* Total Income Card */}
          <LinearGradient
            colors={['rgba(0,255,136,0.12)', 'rgba(0,255,136,0.03)']}
            style={styles.totalCard}
          >
            <View style={styles.totalLeft}>
              <View style={styles.totalIconBg}>
                <Ionicons name="trending-up" size={24} color={Colors.neonGreen} />
              </View>
              <View>
                <Text style={styles.totalLabel}>Toplam Aylık Gelir</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(summary.totalIncome, user?.currency)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Income List */}
          {incomes.length > 0 ? (
            <View style={styles.list}>
              {incomes.map((income) => (
                <View key={income.id} style={[styles.incomeCard, !income.isActive && styles.inactiveCard]}>
                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={() => toggleActive(income.id, income.isActive)}
                  >
                    <Ionicons
                      name={income.isActive ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={income.isActive ? Colors.neonGreen : Colors.textMuted}
                    />
                  </TouchableOpacity>
                  <View style={styles.incomeInfo}>
                    <Text style={[styles.incomeName, !income.isActive && styles.inactiveText]}>
                      {income.title}
                    </Text>
                    <Text style={styles.incomeFreq}>{getFrequencyLabel(income.frequency)}</Text>
                  </View>
                  <Text style={[styles.incomeAmount, !income.isActive && styles.inactiveText]}>
                    +{formatCurrency(income.amount, user?.currency)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(income.id, income.title)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Henüz gelir eklenmedi</Text>
              <Text style={styles.emptyText}>
                Maaşınızı ve diğer gelir kaynaklarınızı ekleyerek başlayın.
              </Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <LinearGradient
          colors={[Colors.gradientPurpleStart, Colors.neonPurple]}
          style={styles.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Gelir Ekle</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gelir Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Maaş, Freelance..."
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tutar ({user?.currency || '₺'})</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sıklık</Text>
              <View style={styles.freqRow}>
                {FREQUENCIES.map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                    onPress={() => setFrequency(f)}
                  >
                    <Text style={[styles.freqBtnText, frequency === f && styles.freqBtnTextActive]}>
                      {FREQ_LABELS[f]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdd} activeOpacity={0.8}>
                <LinearGradient
                  colors={[Colors.gradientPurpleStart, Colors.neonPurple]}
                  style={styles.saveBtn}
                >
                  <Text style={styles.saveBtnText}>Kaydet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: 60 },
  header: { marginBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neonGreen + '30',
    marginBottom: Spacing.xxl,
  },
  totalLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  totalIconBg: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.neonGreen + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  totalAmount: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.neonGreen, marginTop: 2 },
  list: { gap: Spacing.md },
  incomeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md,
  },
  inactiveCard: { opacity: 0.5 },
  toggleBtn: { padding: 2 },
  incomeInfo: { flex: 1 },
  incomeName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  incomeFreq: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  incomeAmount: { fontSize: FontSize.md, fontWeight: '700', color: Colors.neonGreen },
  inactiveText: { color: Colors.textMuted },
  deleteBtn: { padding: Spacing.sm },
  fab: {
    position: 'absolute', bottom: 100, right: 20,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    ...Shadow.neonPurple,
  },
  emptyState: {
    alignItems: 'center', paddingVertical: 60, gap: Spacing.md,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xxl, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xxl,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.textMuted, alignSelf: 'center', marginBottom: Spacing.xl,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xxl },
  inputGroup: { marginBottom: Spacing.xl },
  inputLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md,
    padding: Spacing.lg, color: Colors.textPrimary, fontSize: FontSize.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  freqRow: { flexDirection: 'row', gap: Spacing.sm },
  freqBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBg, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  freqBtnActive: {
    borderColor: Colors.neonPurple, backgroundColor: Colors.neonPurple + '20',
  },
  freqBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  freqBtnTextActive: { color: Colors.neonPurple },
  modalActions: {
    flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBg, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
});
