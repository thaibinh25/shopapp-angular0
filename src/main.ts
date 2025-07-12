import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app/app.component';
import { TranslateService } from '@ngx-translate/core';


// ✅ Giả lập biến global để tránh lỗi sockjs-client
(window as any).global = window;


bootstrapApplication(AppComponent, appConfig).then(appRef => {
    const injector = appRef.injector;
    const translate = injector.get(TranslateService);
  
    const savedLang = localStorage.getItem('lang') || 'vi';
    translate.setDefaultLang('vi');
    translate.use(savedLang);
  });

