<script setup>
import { usePreferencesStore } from "@/stores/PreferencesStore";

usePreferencesStore();
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
</style>
