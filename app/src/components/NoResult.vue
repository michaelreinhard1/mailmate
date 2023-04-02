<script setup>
import { useEmailStore } from "@/stores/EmailStore";
import { useComponentUtilsStore } from "@/stores/ComponentUtilsStore";
import { storeToRefs } from "pinia";
import BaseButton from "./BaseButton.vue";
import { IconSettings } from "@tabler/icons-vue";
import { computed } from "vue";
import MailboxSVG from "@/assets/icons/urban-mailbox.svg?url";

const emailStore = useEmailStore();
const componentUtilsStore = useComponentUtilsStore();

const status = storeToRefs(emailStore).status;

const title = computed(() => {
  if (status.value === "disconnected") {
    return "noResult.disconnected.title";
  }
  if (status.value === "connected") {
    return "noResult.connected.title";
  }
});

const description = computed(() => {
  if (status.value === "disconnected") {
    return "noResult.disconnected.description";
  }
  if (status.value === "connected") {
    return "noResult.connected.description";
  }
});
</script>

<template>
  <div class="flex gap-10" v-if="status !== 'connecting'">
    <img :src="MailboxSVG" class="w-80 h-80" />
    <div class="flex flex-col">
      <h1 class="">
        {{ $t(title) }}
      </h1>
      <p class="text-gray-500 text-2xl">
        {{ $t(description) }}
      </p>
      <BaseButton
        v-if="status === 'disconnected'"
        class="w-fit mt-10 text-md px-3 py-2 flex items-center"
        @click="componentUtilsStore.toggleSettings(1)"
      >
        <IconSettings stroke-width="1.5" class="outline-0" />
        <span class="ml-2">
          {{ $t("noResult.disconnected.button") }}
        </span>
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  font-size: 5rem;
  font-weight: 800;
  @apply dark:text-gray-300;
}
p {
  font-size: 1.25rem;
  word-break: break-word;
  @apply dark:text-gray-300;
}
img {
  user-drag: none;
  @apply select-none;
}
</style>
