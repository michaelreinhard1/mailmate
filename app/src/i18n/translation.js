import i18n from "@/i18n";
import { nextTick } from "vue";
import { useNavigatorLanguage } from "@vueuse/core";

const Trans = {
  get defaultLocale() {
    return import.meta.env.VITE_DEFAULT_LOCALE;
  },

  get supportedLocales() {
    return import.meta.env.VITE_SUPPORTED_LOCALES.split(",");
  },

  get currentLocale() {
    return i18n.global.locale.value;
  },

  set currentLocale(newLocale) {
    i18n.global.locale.value = newLocale;
  },

  async switchLanguage(newLocale) {
    await Trans.loadLocaleMessages(newLocale);
    Trans.currentLocale = newLocale;
    document.querySelector("html").setAttribute("lang", newLocale);
    localStorage.setItem("locale", newLocale);
  },

  async loadLocaleMessages(locale) {
    if (!i18n.global.availableLocales.includes(locale)) {
      const messages = await import(`@/i18n/locales/${locale}.json`);
      i18n.global.setLocaleMessage(locale, messages.default);
    }

    return nextTick();
  },

  isLocaleSupported(locale) {
    return Trans.supportedLocales.includes(locale);
  },

  getUserLocale() {
    const { language } = useNavigatorLanguage();

    return {
      locale: language.value,
      localeNoRegion: language.value.split("-")[0],
    };
  },

  getPersistedLocale() {
    const persistedLocale = localStorage.getItem("locale");

    if (Trans.isLocaleSupported(persistedLocale)) {
      return persistedLocale;
    } else {
      return null;
    }
  },

  guessDefaultLocale() {
    const userPersistedLocale = Trans.getPersistedLocale();
    if (userPersistedLocale) {
      return userPersistedLocale;
    }

    const userPreferredLocale = Trans.getUserLocale();

    if (Trans.isLocaleSupported(userPreferredLocale.locale)) {
      return userPreferredLocale.locale;
    }

    if (Trans.isLocaleSupported(userPreferredLocale.localeNoRegion)) {
      return userPreferredLocale.localeNoRegion;
    }

    return Trans.defaultLocale;
  },

  async setLocale(locale) {
    if (!Trans.isLocaleSupported(locale)) {
      return Trans.guessDefaultLocale();
    }

    await Trans.switchLanguage(locale);
  },
};

export default Trans;
