<script setup>
import { usePreferencesStore } from "@/stores/PreferencesStore";
import { useHead } from "@vueuse/head";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { onUpdated } from "vue";

const { t: $t } = useI18n();

usePreferencesStore();

const title = computed(() => $t("app.title"));
const description = computed(() => $t("app.description"));
const ogTitle = computed(() => $t("app.og.title"));
const ogDescription = computed(() => $t("app.og.description"));

const setHeader = () => {
  useHead({
    title: title.value,
    description: description.value,
    og: {
      title: ogTitle.value,
      description: ogDescription.value,
    },
  });
};

setHeader();

onUpdated(() => {
  setHeader();
});
</script>

<template>
  <router-view />
</template>

<style lang="scss">
@use "vuetify" with (
  $utilities: false,
  $color-pack: false
);
@use "three-dots";
.disable-transitions * {
  transition-property: none !important;
}
#app {
  @apply bg-primary-900 dark:bg-dark-800;
  min-height: 100vh;
}
html {
  overflow: hidden;
}
.custom-scrollbar {
  @apply scrollbar-thin scrollbar-thumb-gray-500/30 overflow-y-scroll scrollbar-thumb-rounded-xl hover:scrollbar-thumb-gray-500/20;
}
</style>
