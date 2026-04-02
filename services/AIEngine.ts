import { AIInsight, BudgetSummary, Expense, Income } from '../constants/types';
import { Colors, CategoryIcons } from '../constants/theme';

export function generateInsights(
  summary: BudgetSummary,
  expenses: Expense[],
  incomes: Income[]
): AIInsight[] {
  const insights: AIInsight[] = [];

  // 1. Tasarruf oranı analizi
  if (summary.savingsRate < 10 && summary.totalIncome > 0) {
    insights.push({
      id: 'low_savings',
      type: 'warning',
      title: '⚠️ Tasarruf Oranınız Düşük',
      description: `Aylık gelirinizin sadece %${summary.savingsRate.toFixed(1)}\'ini biriktiriyorsunuz. Finansal güvenlik için en az %20 tasarruf hedefleyin.`,
      icon: 'warning',
      color: Colors.warning,
    });
  } else if (summary.savingsRate >= 20) {
    insights.push({
      id: 'good_savings',
      type: 'achievement',
      title: '🏆 Harika Tasarruf!',
      description: `Gelirinizin %${summary.savingsRate.toFixed(1)}\'ini biriktiriyorsunuz! Bu mükemmel bir oran, böyle devam edin.`,
      icon: 'trophy',
      color: Colors.success,
    });
  }

  // 2. En büyük harcama kategorisi
  if (summary.categoryBreakdown.length > 0) {
    const top = summary.categoryBreakdown[0];
    const catInfo = CategoryIcons[top.category] || { label: top.category };
    if (top.percentage > 40) {
      insights.push({
        id: 'high_category',
        type: 'warning',
        title: `📊 ${catInfo.label} Harcamaları Yüksek`,
        description: `Toplam harcamalarınızın %${top.percentage.toFixed(0)}\'si ${catInfo.label} kategorisinde. Bu oranı %30\'un altına çekmeyi deneyin.`,
        amount: top.amount,
        category: top.category,
        icon: 'pie-chart',
        color: Colors.neonOrange,
      });
    }
  }

  // 3. Bütçe aşımı
  if (summary.balance < 0) {
    insights.push({
      id: 'over_budget',
      type: 'warning',
      title: '🚨 Bütçe Aşımı!',
      description: `Bu ay bütçenizi ₺${Math.abs(summary.balance).toLocaleString('tr-TR')} aştınız. Gereksiz harcamaları gözden geçirin.`,
      amount: Math.abs(summary.balance),
      icon: 'alert-circle',
      color: Colors.danger,
    });
  }

  // 4. Gelir çeşitliliği
  if (incomes.length === 1) {
    insights.push({
      id: 'single_income',
      type: 'tip',
      title: '💡 Gelir Kaynağı Önerisi',
      description: 'Tek bir gelir kaynağınız var. Ek gelir kaynakları (freelance, yatırım) oluşturmak finansal güvenliğinizi artırır.',
      icon: 'bulb',
      color: Colors.neonCyan,
    });
  }

  // 5. Düzenli harcama optimizasyonu
  const subscriptions = expenses.filter(e => e.frequency === 'monthly' && e.amount < 200);
  if (subscriptions.length >= 3) {
    const totalSub = subscriptions.reduce((s, e) => s + e.amount, 0);
    insights.push({
      id: 'subscriptions',
      type: 'saving',
      title: '💳 Abonelik Kontrolü',
      description: `${subscriptions.length} aktif aboneliğiniz var (toplam ₺${totalSub.toLocaleString('tr-TR')}/ay). Kullanmadıklarınızı iptal ederek tasarruf edebilirsiniz.`,
      amount: totalSub,
      icon: 'card',
      color: Colors.neonPurple,
    });
  }

  // 6. 50/30/20 kuralı analizi
  if (summary.totalIncome > 0) {
    const needsCategories = ['kira', 'fatura', 'market', 'ulasim', 'saglik'];
    const needsTotal = summary.categoryBreakdown
      .filter(c => needsCategories.includes(c.category))
      .reduce((s, c) => s + c.amount, 0);
    const needsPercentage = (needsTotal / summary.totalIncome) * 100;

    let ruleAdvice = '';
    if (needsPercentage > 50) {
      ruleAdvice = `Zorunlu harcamalarınız gelirinizin %${needsPercentage.toFixed(0)}\'sini oluşturuyor. 50/30/20 kuralına göre bu oran %50\'yi geçmemeli.`;
    } else {
      ruleAdvice = `Zorunlu harcamalarınız gelirinizin %${needsPercentage.toFixed(0)}\'sinde - 50/30/20 kuralına uygun! Geri kalanı istekler (%30) ve tasarruf (%20) için ayırabilirsiniz.`;
    }

    insights.push({
      id: 'rule_503020',
      type: needsPercentage > 50 ? 'tip' : 'achievement',
      title: '📐 50/30/20 Bütçe Kuralı',
      description: ruleAdvice,
      icon: 'calculator',
      color: needsPercentage > 50 ? Colors.neonOrange : Colors.neonGreen,
    });
  }

  // 7. Boş veri durumu
  if (expenses.length === 0 && incomes.length === 0) {
    insights.push({
      id: 'welcome',
      type: 'tip',
      title: '👋 Hoş Geldiniz!',
      description: 'Harcama ve gelir verilerinizi eklediğinizde, yapay zeka motorumuz size kişiselleştirilmiş öneriler sunacak.',
      icon: 'sparkles',
      color: Colors.neonPurple,
    });
  }

  // 8. Sağlık skoru
  if (summary.totalIncome > 0) {
    let score = 100;
    if (summary.savingsRate < 20) score -= 20;
    if (summary.savingsRate < 10) score -= 15;
    if (summary.balance < 0) score -= 30;
    if (summary.categoryBreakdown.length > 0 && summary.categoryBreakdown[0].percentage > 40) score -= 10;

    const emoji = score >= 80 ? '💚' : score >= 60 ? '💛' : '❤️';
    insights.push({
      id: 'health_score',
      type: score >= 70 ? 'achievement' : 'warning',
      title: `${emoji} Bütçe Sağlık Puanı: ${Math.max(0, score)}/100`,
      description: score >= 80
        ? 'Mali sağlığınız mükemmel durumda! Harcamalarınızı iyi yönetiyorsunuz.'
        : score >= 60
        ? 'Bütçeniz iyi durumda ama iyileştirme alanları var. Önerileri takip edin.'
        : 'Bütçenizde önemli iyileştirmeler yapılmalı. Yukarıdaki önerileri dikkate alın.',
      icon: 'heart',
      color: score >= 80 ? Colors.success : score >= 60 ? Colors.warning : Colors.danger,
    });
  }

  return insights;
}

export function getBudgetHealthColor(savingsRate: number): string {
  if (savingsRate >= 20) return Colors.success;
  if (savingsRate >= 10) return Colors.warning;
  return Colors.danger;
}

export function formatCurrency(amount: number, currency: string = '₺'): string {
  return `${currency}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getFrequencyLabel(freq: string): string {
  const labels: Record<string, string> = {
    once: 'Tek Seferlik',
    daily: 'Günlük',
    weekly: 'Haftalık',
    monthly: 'Aylık',
    yearly: 'Yıllık',
  };
  return labels[freq] || freq;
}
