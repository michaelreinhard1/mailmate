<script setup>
const props = defineProps({
  color: {
    type: String,
    default: "default",
  },
});
</script>

<template>
  <div
    class="dot-elastic"
    :class="{
      default: color === 'default',
      light: color === 'light',
      dark: color === 'dark',
    }"
  />
</template>

<style scoped lang="scss">
.default {
  @apply text-dark-800 bg-dark-800 dark:text-white dark:bg-white before:text-dark-800 after:text-dark-800 before:dark:text-white after:dark:text-white before:dark:bg-white after:dark:bg-white before:bg-dark-800 after:bg-dark-800;
}

.light {
  @apply text-white bg-white before:text-white after:text-white before:bg-white after:bg-white;
}

.dark {
  @apply text-dark-800 bg-dark-800 before:text-dark-800 after:text-dark-800 before:bg-dark-800 after:bg-dark-800;
}
</style>
