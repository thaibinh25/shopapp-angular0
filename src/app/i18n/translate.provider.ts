import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { importProvidersFrom, inject } from '@angular/core';

// ✅ Inject trực tiếp HttpClient (không cần deps)
export function HttpLoaderFactory(): TranslateHttpLoader {
  const http = inject(HttpClient);
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideTranslate() {
  return importProvidersFrom(
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory
      }
    })
  );
}
