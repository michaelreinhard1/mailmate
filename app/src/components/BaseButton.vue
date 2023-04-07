<template>
  <button
    v-ripple="{ center: true }"
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
button {
  @apply relative flex justify-center gap-2 text-sm rounded-lg px-3 py-2 items-center disabled:opacity-50 disabled:cursor-default;
}
.primary-button {
  @apply bg-accent-900 text-white hover:bg-accent-900/90 disabled:bg-accent-900 disabled:hover:bg-accent-900;
}

.secondary-button {
  @apply bg-primary-700 hover:bg-primary-700/80 text-dark-900 transition-colors rounded-lg dark:bg-dark-500 dark:text-white disabled:bg-primary-700 disabled:hover:bg-primary-700 disabled:dark:hover:bg-dark-500;
}
</style>
