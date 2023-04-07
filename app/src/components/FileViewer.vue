<script setup>
import { ref } from "vue";
import { IconDownload, IconX } from "@tabler/icons-vue";
import BaseButton from "@/components/BaseButton.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
} from "@headlessui/vue";

const isOpen = ref(false);

function closeModal() {
  isOpen.value = false;
}
function openModal() {
  isOpen.value = true;
}

const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div @click="openModal" class="w-12 h-12 rounded-xl overflow-hidden">
    <img
      :src="file.url"
      v-if="file.type.includes('image')"
      class="object-contain cursor-pointer w-full h-full"
    />
    <img
      :src="file.fileIcon"
      alt="file-icon"
      class="object-contain cursor-pointer w-full h-full"
      v-if="file.type.includes('pdf')"
    />
    <video
      :src="file.url"
      v-if="file.type.includes('video')"
      class="object-contain cursor-pointer w-full h-full"
      controls
    />
  </div>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/[.7]" />
      </TransitionChild>

      <div class="fixed inset-0 flex flex-col items-center justify-center">
        <div class="flex w-5/6 h-5/6 justify-center text-center relative">
          <button class="fixed top-11 right-11">
            <IconX class="w-6 h-6 text-white" @click="closeModal" />
          </button>

          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="transform rounded-2xl text-left align-middle transition-all flex flex-col"
              :class="{
                'w-full h-full': file.type.includes('pdf'),
              }"
            >
              <img
                :src="file.url"
                v-if="file.type.includes('image')"
                class="w-full h-full m-auto object-contain rounded-lg"
              />
              <video
                :src="file.url"
                v-if="file.type.includes('video')"
                class="w-full h-full m-auto object-contain rounded-lg"
                controls
              />
              <embed
                :src="file.url"
                v-if="file.type.includes('pdf')"
                class="w-full h-full m-auto object-contain rounded-lg"
                type="application/pdf"
              />
              <div class="flex justify-center py-5">
                <a :download="file.name" :href="file.url">
                  <BaseButton>
                    <IconDownload class="w-5 h-5" />
                    {{ $t("email.download") }}
                  </BaseButton>
                </a>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
