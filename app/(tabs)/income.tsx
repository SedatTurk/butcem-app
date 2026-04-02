import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, Animated, Platform, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { useBudget } from '../../services/BudgetContext';
import { Colors, FontSize, BorderRadius, Spacing, Shadow } from '../../constants/theme';
import { formatCurrency, getFrequencyLabel } from '../../services/AIEngine';
import { Income } from '../../constants/types';
import SwipeModal, { NumericDoneBar } from '../../components/SwipeModal';

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

  // Düzenleme
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editFrequency, setEditFrequency] = useState<typeof FREQUENCIES[number]>('monthly');

  // Numeric "Tamam" bar visibility
  const [showDoneBar, setShowDoneBar] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setShowDoneBar(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setShowDoneBar(false)
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleAdd = async () => {
    Keyboard.dismiss();
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

  const openEdit = (income: Income) => {
    setEditingIncome(income);
    setEditTitle(income.title);
    setEditAmount(income.amount.toString());
    setEditFrequency(income.frequency as typeof FREQUENCIES[number]);
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    Keyboard.dismiss();
    if (!editingIncome) return;
    if (!editTitle.trim() || !editAmount.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    const numAmount = parseFloat(editAmount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }
    await updateIncome(editingIncome.id, {
      title: editTitle.trim(),
      amount: numAmount,
      frequency: editFrequency,
    });
    setShowEditModal(false);
    setEditingIncome(null);
  };

  const renderForm = (
    isEdit: boolean,
    formTitle: string, formAmount: string, formFrequency: typeof FREQUENCIES[number],
    setFormTitle: (v: string) => void, setFormAmount: (v: string) => void,
    setFormFrequency: (v: typeof FREQUENCIES[number]) => void,
    onSave: () => void,
  ) => (
    <>
      <Text style={styles.modalTitle}>{isEdit ? 'Gelir Düzenle' : 'Gelir Ekle'}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gelir Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Maaş, Freelance..."
          placeholderTextColor={Colors.textMuted}
          value={formTitle}
          onChangeText={setFormTitle}
          returnKeyType="next"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tutar ({user?.currency || '₺'})</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={Colors.textMuted}
          value={formAmount}
          onChangeText={setFormAmount}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Sıklık</Text>
        <View style={styles.freqRow}>
          {FREQUENCIES.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.freqBtn, formFrequency === f && styles.freqBtnActive]}
              onPress={() => { Keyboard.dismiss(); setFormFrequency(f); }}
            >
              <Text style={[styles.freqBtnText, formFrequency === f && styles.freqBtnTextActive]}>
                {FREQ_LABELS[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showDoneBar && <NumericDoneBar />}

      <View style={styles.modalActions}>
        <TouchableOpacity onPress={onSave} activeOpacity={0.8} style={{ flex: 1 }}>
          <LinearGradient
            colors={isEdit ? [Colors.neonGreen + 'DD', Colors.neonGreen] : [Colors.gradientPurpleStart, Colors.neonPurple]}
            style={styles.saveBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark" size={18} color={isEdit ? '#000' : '#fff'} style={{ marginRight: 6 }} />
            <Text style={[styles.saveBtnText, isEdit && { color: '#000' }]}>
              {isEdit ? 'Güncelle' : 'Kaydet'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={styles.title}>Gelirler</Text>
            <Text style={styles.subtitle}>Gelir kaynaklarınızı yönetin</Text>
          </View>

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
                  <TouchableOpacity style={styles.incomeInfo} onPress={() => openEdit(income)} activeOpacity={0.6}>
                    <Text style={[styles.incomeName, !income.isActive && styles.inactiveText]}>
                      {income.title}
                    </Text>
                    <View style={styles.incomeMetaRow}>
                      <Text style={styles.incomeFreq}>{getFrequencyLabel(income.frequency)}</Text>
                      <View style={styles.editHint}>
                        <Ionicons name="pencil" size={10} color={Colors.neonPurple} />
                        <Text style={styles.editHintText}>Düzenle</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
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
      <SwipeModal visible={showModal} onClose={() => setShowModal(false)}>
        {renderForm(false, title, amount, frequency, setTitle, setAmount, setFrequency, handleAdd)}
      </SwipeModal>

      {/* Edit Modal */}
      <SwipeModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        {renderForm(true, editTitle, editAmount, editFrequency, setEditTitle, setEditAmount, setEditFrequency, handleEdit)}
      </SwipeModal>
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
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.xl, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.neonGreen + '30',
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
  incomeFreq: { fontSize: FontSize.sm, color: Colors.textSecondary },
  incomeMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 8 },
  editHint: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: 6, backgroundColor: Colors.neonPurple + '15',
  },
  editHintText: { fontSize: 10, color: Colors.neonPurple, fontWeight: '500' },
  incomeAmount: { fontSize: FontSize.md, fontWeight: '700', color: Colors.neonGreen },
  inactiveText: { color: Colors.textMuted },
  deleteBtn: { padding: Spacing.sm },
  fab: {
    position: 'absolute', bottom: 100, right: 20,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    ...Shadow.neonPurple,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },

  // Modal Form
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xl, marginTop: Spacing.sm },
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md,
    padding: Spacing.lg, color: Colors.textPrimary, fontSize: FontSize.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  freqRow: { flexDirection: 'row', gap: Spacing.sm },
  freqBtn: {
    flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBg, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  freqBtnActive: { borderColor: Colors.neonPurple, backgroundColor: Colors.neonPurple + '20' },
  freqBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '500' },
  freqBtnTextActive: { color: Colors.neonPurple },
  modalActions: { marginTop: Spacing.xl },
  saveBtn: {
    height: 50, borderRadius: BorderRadius.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
});
