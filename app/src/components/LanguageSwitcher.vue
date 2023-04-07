<script>
import { useI18n } from "vue-i18n";
import Tr from "@/i18n/translation";
import Dropdown from "@/components/Dropdown.vue";
import { usePreferencesStore } from "@/stores/PreferencesStore";

export default {
  setup() {
    const { t, locale } = useI18n();

    const preferencesStore = usePreferencesStore();

    const supportedLocales = Tr.supportedLocales;

    const switchLanguage = async (value) => {
      const newLocale = value;

      preferencesStore.setLocale(newLocale);
    };

    return { t, locale, supportedLocales, switchLanguage };
  },
  components: {
    Dropdown,
  },
  computed: {
    dropdownItems() {
      const currentLocale = this.locale;
      const sortedLocales = [...this.supportedLocales].sort((a, b) => {
        if (a === currentLocale) return -1;
        if (b === currentLocale) return 1;
        return 0;
      });

      return sortedLocales.map((sLocale) => {
        return {
          name: this.t(`locale.${sLocale}`),
          value: sLocale,
          selected: this.locale === sLocale,
          onClick: sLocale,
        };
      });
    },
  },
  methods: {
    async handleExecuteAction(language) {
      try {
        await this.switchLanguage(language);
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

<template>
  <Dropdown :items="dropdownItems" @executeAction="handleExecuteAction">
    {{ t(`locale.${locale}`) }}
  </Dropdown>
</template>
