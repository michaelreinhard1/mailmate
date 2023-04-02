import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useDark } from "@vueuse/core";
import { useNavigatorLanguage } from "@vueuse/core";
import Tr from "@/i18n/translation";
import { useI18n } from "vue-i18n";

const { language } = useNavigatorLanguage();

export const usePreferencesStore = defineStore("PreferencesStore", {
  state: () => ({
    sideBarCollapsed: useStorage("sideBarCollapsed", false),
    isDark: useDark({
      valueDark: "dark",
      valueLight: "light",
    }),
    locale: useStorage("locale", language.value.split("-")[0]),
  }),
  getters: {
    getSideBarCollapsed() {
      return this.sideBarCollapsed;
    },
  },
  actions: {
    async toggleSideBar() {
      this.sideBarCollapsed = !this.sideBarCollapsed;
    },
    toggleDarkMode(state) {
      this.isDark = state;
    },
    async setLocale(newLocale) {
      this.locale = newLocale;

      await Tr.switchLanguage(newLocale);
    },
  },
});
