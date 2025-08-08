import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  priority: string;
}
@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  contactForm: ContactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  };

  quickFaqs = [
    '注文をキャンセルしたい',
    '配送状況を確認したい',
    '返品・交換について',
    'パスワードを忘れた',
    '製品の保証について'
  ];

  submitForm() {
    console.log('Contact form submitted:', this.contactForm);
    // Implement form submission logic
    alert('お問い合わせを受け付けました。24時間以内にご返信いたします。');
    this.resetForm();
  }

  resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: '',
      message: '',
      priority: 'medium'
    };
  }
}