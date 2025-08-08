import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  isExpanded?: boolean;
}

interface SupportCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  articles: number;
}
@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss'
})
export class SupportComponent {
  searchQuery = '';
  activeFaqCategory = 'すべて';

  quickActions = [
    {
      icon: '📦',
      title: '注文状況を確認',
      description: 'ご注文の配送状況を追跡できます',
      buttonText: '追跡する'
    },
    {
      icon: '🔄',
      title: '返品・交換',
      description: '商品の返品や交換手続きについて',
      buttonText: '手続きを開始'
    },
    {
      icon: '💳',
      title: '支払いについて',
      description: '支払い方法や請求に関するお問い合わせ',
      buttonText: '詳細を見る'
    },
    {
      icon: '🛡️',
      title: '保証について',
      description: '製品保証やアフターサービス',
      buttonText: '保証を確認'
    }
  ];

  supportCategories: SupportCategory[] = [
    {
      id: 'orders',
      name: '注文・配送',
      icon: '📦',
      description: '注文方法、配送、追跡について',
      articles: 15
    },
    {
      id: 'products',
      name: '製品情報',
      icon: '📱',
      description: '製品の仕様、使い方、トラブルシューティング',
      articles: 28
    },
    {
      id: 'account',
      name: 'アカウント',
      icon: '👤',
      description: 'アカウント設定、パスワード、個人情報',
      articles: 12
    },
    {
      id: 'payment',
      name: '支払い・請求',
      icon: '💳',
      description: '支払い方法、請求書、返金について',
      articles: 18
    },
    {
      id: 'warranty',
      name: '保証・修理',
      icon: '🛡️',
      description: '製品保証、修理サービス、交換について',
      articles: 22
    },
    {
      id: 'technical',
      name: '技術サポート',
      icon: '⚙️',
      description: 'セットアップ、接続、技術的な問題',
      articles: 35
    }
  ];

  faqCategories = ['すべて', '注文・配送', '製品', 'アカウント', '支払い', '保証'];

  faqs: FAQ[] = [
    {
      id: 1,
      question: '注文をキャンセルできますか？',
      answer: 'ご注文後24時間以内であれば、マイページの注文履歴からキャンセルが可能です。商品が発送済みの場合は、返品手続きをお取りください。',
      category: '注文・配送'
    },
    {
      id: 2,
      question: '配送にはどのくらい時間がかかりますか？',
      answer: '通常、ご注文から2-3営業日でお届けいたします。お急ぎの場合は、翌日配送オプション（有料）もご利用いただけます。',
      category: '注文・配送'
    },
    {
      id: 3,
      question: '製品の保証期間はどのくらいですか？',
      answer: 'すべての製品にメーカー保証が付いています。期間は製品により異なりますが、通常1年間です。詳細は各製品ページでご確認ください。',
      category: '保証'
    },
    {
      id: 4,
      question: 'パスワードを忘れてしまいました',
      answer: 'ログインページの「パスワードを忘れた方」をクリックし、登録メールアドレスを入力してください。パスワードリセット用のリンクをお送りします。',
      category: 'アカウント'
    },
    {
      id: 5,
      question: '支払い方法を変更できますか？',
      answer: 'マイページの「支払い方法」から、クレジットカードの追加・削除・変更が可能です。デフォルトの支払い方法も設定できます。',
      category: '支払い'
    }
  ];

  filteredFaqs: FAQ[] = [];

  ngOnInit() {
    this.filterFaqs();
  }

  setActiveFaqCategory(category: string) {
    this.activeFaqCategory = category;
    this.filterFaqs();
  }

  filterFaqs() {
    if (this.activeFaqCategory === 'すべて') {
      this.filteredFaqs = [...this.faqs];
    } else {
      this.filteredFaqs = this.faqs.filter(faq => faq.category === this.activeFaqCategory);
    }
  }

  toggleFaq(id: number) {
    const faq = this.filteredFaqs.find(f => f.id === id);
    if (faq) {
      faq.isExpanded = !faq.isExpanded;
    }
  }

  selectCategory(categoryId: string) {
    console.log('Selected category:', categoryId);
  }
}