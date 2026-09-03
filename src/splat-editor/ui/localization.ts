import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const i18n = i18next.createInstance();

i18n.use(HttpBackend)
    .use(LanguageDetector)
    .init({
        lng: 'en',
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false
        },
        backend: {
            loadPath: '/splat-editor/locales/{{lng}}.json'
        },
        detection: {
            order: ['querystring', 'localStorage', 'navigator'],
            lookupQuerystring: 'lng',
            caches: ['localStorage']
        }
    });

export const t = i18n.t.bind(i18n);