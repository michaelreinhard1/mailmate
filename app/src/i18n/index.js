import { createI18n } from "vue-i18n";
import datetimeFormats from "./rules/datetime.js";
import pluralRules from "./rules/pluralization.js";
import nl from "./locales/nl.json";
import en from "./locales/en.json";

export default createI18n({
  locale: import.meta.env.VITE_DEFAULT_LOCALE || "en",
  fallbackLocale: import.meta.env.VITE_FALLBACK_LOCALE || "en",
  legacy: false,
  globalInjection: true,
  messages: { nl, en },
  pluralRules,
  datetimeFormats,
});
