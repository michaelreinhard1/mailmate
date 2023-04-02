<template>
  <button
    v-ripple="{ center: true }"
    class="relative"
    type="button"
    :class="
      type === 'primary'
        ? 'primary-button'
        : type === 'secondary'
        ? 'secondary-button'
        : ''
    "
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: "primary",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.primary-button {
  @apply bg-accent-900 text-sm text-white rounded-lg hover:bg-accent-900/90 transition-colors px-3 py-2 flex items-center;
}
.secondary-button {
  @apply bg-primary-700 hover:bg-primary-700/80 text-sm text-dark-900 rounded-lg  transition-colors px-3 py-2 dark:bg-dark-500 dark:text-white flex items-center disabled:opacity-50 disabled:cursor-default disabled:bg-primary-700 disabled:hover:bg-primary-700 disabled:dark:hover:bg-dark-500;
}
</style>
