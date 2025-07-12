import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule,TranslateModule, CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit{
  currentLang: string = 'vi'; // hoặc 'en'
  newsletterEmail: string = '';

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    // Lấy ngôn ngữ hiện tại từ localStorage hoặc TranslateService
    const lang = localStorage.getItem('lang') || this.translate.currentLang || 'vi';
    this.currentLang = lang;
    this.translate.use(lang);
  }
  changeLanguage(event: Event) {
    const lang = (event.target as HTMLSelectElement).value;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
}


  subscribeNewsletter(): void {
    if (this.newsletterEmail.trim()) {
      console.log('Newsletter subscription for:', this.newsletterEmail);
      // Implement newsletter subscription logic here
      this.newsletterEmail = '';
    }
  }
}