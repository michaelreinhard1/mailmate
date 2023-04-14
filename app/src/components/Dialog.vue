<script setup>
import BaseButton from "@/components/BaseButton.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  primaryButtonText: {
    type: String,
    required: true,
  },
  secondaryButtonText: {
    type: String,
  },
});

const emits = defineEmits(["close"], ["primaryButtonAction"]);

function executePrimaryButtonAction() {
  emits("primaryButtonAction");
}

function closeModal() {
  emits("close");
}
function openModal() {
  isOpen.value = true;
}
</script>

<template>
  <TransitionRoot appear :show="props.isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
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
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-900 dark:text-white"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                {{ props.title }}
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-300">
                  {{ props.body }}
                </p>
              </div>

              <div class="mt-4 gap-2 flex justify-end">
                <BaseButton
                  v-if="props.secondaryButtonText"
                  type="secondary"
                  @click="closeModal"
                  class="bg-gray-200 dark:bg-dark-500"
                >
                  {{ props.secondaryButtonText }}
                </BaseButton>

                <BaseButton type="primary" @click="executePrimaryButtonAction">
                  {{ props.primaryButtonText }}
                </BaseButton>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
