<script>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
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
      return this.supportedLocales.map((sLocale) => {
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
  <!-- <select
    id="countries"
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    @change="switchLanguage"
  >
    <option
      v-for="sLocale in supportedLocales"
      :key="`locale-${sLocale}`"
      :value="sLocale"
      :selected="locale === sLocale"
    >
      {{ t(`locale.${sLocale}`) }}
    </option>
  </select> -->

  <Dropdown :items="dropdownItems" @executeAction="handleExecuteAction">
    {{ t(`locale.${locale}`) }}
  </Dropdown>
</template>
