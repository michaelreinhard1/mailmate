import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useDark } from "@vueuse/core";
import { useNavigatorLanguage } from "@vueuse/core";
import Tr from "@/i18n/translation";
import { onMounted, watch } from "vue";

const { language } = useNavigatorLanguage();

export const usePreferencesStore = defineStore("PreferencesStore", () => {
  // initialize state variables
  const sideBarCollapsed = useStorage("sideBarCollapsed", false);
  const isDark = useDark({
    valueDark: "dark",
    valueLight: "light",
  });
  const locale = useStorage("locale", language.value.split("-")[0]);
  const showCounters = useStorage("showCounters", true);

  onMounted(async () => {
    await Tr.setLocale(locale.value);
  });

  // watch for changes to locale and update translation language
  watch(locale, async (newLocale) => {
    await Tr.setLocale(newLocale);
  });

  // perform actions
  function toggleSideBar() {
    sideBarCollapsed.value = !sideBarCollapsed.value;
  }
  function toggleDarkMode(state) {
    document.body.classList.add("disable-transitions");
    isDark.value = state;

    // Switch the theme here...

    // Remove the "disable-transitions" class after a short delay
    setTimeout(() => {
      document.body.classList.remove("disable-transitions");
    }, 100);
  }
  async function setLocale(newLocale) {
    locale.value = newLocale;
  }

  return {
    sideBarCollapsed,
    isDark,
    locale,
    toggleSideBar,
    toggleDarkMode,
    setLocale,
    showCounters,
  };
});
