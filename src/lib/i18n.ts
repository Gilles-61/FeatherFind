
const dictionaries = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  fr: () => import('@/locales/fr.json').then((module) => module.default),
  es: () => import('@/locales/es.json').then((module) => module.default),
}
 
export const getDictionary = async (locale: 'en' | 'fr' | 'es') => {
    const loader = dictionaries[locale] || dictionaries.en;
    return loader();
}
