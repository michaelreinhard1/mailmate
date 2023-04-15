<script setup>
import { usePreferencesStore } from "@/stores/PreferencesStore";
import { useToolStore } from "@/stores/ToolStore";
import { useHead } from "@vueuse/head";
import { useI18n } from "vue-i18n";
import { computed, onMounted, onUpdated } from "vue";
import { useUrlSearchParams } from "@vueuse/core";

const { t: $t } = useI18n();

const preferencesStore = usePreferencesStore();

usePreferencesStore();
useToolStore();

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

onMounted(() => {
  const params = useUrlSearchParams("history");
  params.tauri;
  if (params.tauri === "true" || preferencesStore.tauri) {
    preferencesStore.tauri = true;
  }
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
