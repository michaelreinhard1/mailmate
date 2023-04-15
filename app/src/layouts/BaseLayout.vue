<script setup>
import Navbar from "@/components/Navbar.vue";
import Compose from "@/components/Compose.vue";
import { useComponentUtilsStore } from "@/stores/ComponentUtilsStore";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import SettingsPage from "../views/SettingsPage.vue";

const componentUtilsStore = useComponentUtilsStore();

// Open/close the compose modal
const showCompose = storeToRefs(componentUtilsStore).showCompose;
</script>

<template>
  <div class="flex">
    <Navbar @compose="showCompose = true" @close="showCompose = false" />
    <div class="w-full relative">
      <Transition name="fade">
        <Compose
          :show="showCompose"
          @close="showCompose = false"
          v-if="showCompose"
          type="new"
          class="z-50 bg-primary-900 border dark:border-dark-500 dark:bg-dark-800 dark:text-primary-900 absolute overflow-hidden"
        />
      </Transition>
      <SettingsPage />
      <slot @compose="showCompose = true" />
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  @apply transition-all;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-leave,
.fade-enter-to {
  opacity: 1;
}
</style>
