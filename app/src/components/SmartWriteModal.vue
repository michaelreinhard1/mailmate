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
          class="flex min-h-full items-center justify-center p-4 text-center w-1/2 m-auto"
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
              class="w-full transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-900 dark:text-white"
            >
              <DialogTitle class="text-2xl font-bold">
                {{ $t("tool.smartWrite.title") }}
                {{ loading ? "Loading..." : "" }}
              </DialogTitle>

              <div id="options" class="my-7">
                <label
                  for="emailSubject"
                  class="block text-sm font-medium text-gray-700 dark:text-white mb-5"
                >
                  {{ $t("tool.smartWrite.tonality.title") }}
                </label>
                <RadioGroup v-model="selected" :disabled="loading">
                  <RadioGroupLabel class="sr-only">{{
                    $t("tool.smartWrite.tonality.title")
                  }}</RadioGroupLabel>

                  <div class="flex flex-wrap gap-3">
                    <RadioGroupOption
                      as="template"
                      v-for="tone in tonalities"
                      :key="tone.name"
                      :value="tone"
                      v-slot="{ active, checked }"
                      class="transition-colors"
                      v-ripple="{ center: true }"
                    >
                      <div
                        :class="[
                          active ? ' ' : '',
                          checked
                            ? 'bg-accent-900 text-white '
                            : 'bg-primary-700 hover:bg-primary-700/80 rounded-lg  transition-colors px-3 py-2 dark:bg-dark-500  flex items-center disabled:opacity-50 disabled:cursor-default disabled:bg-primary-700 disabled:hover:bg-primary-700',
                        ]"
                        class="relative flex cursor-pointer rounded-lg px-3 py-2 shadow-md focus:outline-none"
                      >
                        <div class="flex w-full items-center justify-between">
                          <div class="flex items-center">
                            <div class="text-sm">
                              <RadioGroupLabel
                                as="p"
                                :class="
                                  checked
                                    ? 'text-white'
                                    : 'text-dark-900 dark:text-white'
                                "
                                class="font-medium select-none"
                              >
                                {{ tone.name }}
                              </RadioGroupLabel>
                              <RadioGroupDescription
                                as="span"
                                :class="
                                  checked ? 'text-sky-100' : 'text-gray-500'
                                "
                                class="inline"
                              >
                              </RadioGroupDescription>
                            </div>
                          </div>
                        </div>
                      </div>
                    </RadioGroupOption>
                  </div>
                </RadioGroup>
              </div>

              <textarea
                id="emailTextarea"
                name="email"
                rows="10"
                cols="50"
                v-model="emailBody"
                placeholder="Write an email about "
                class="w-full h-96 border border-gray-300 dark:border-dark-500 rounded-md p-4 resize-none bg-gray-100 dark:bg-dark-700 outline-none"
                spellcheck="false"
              ></textarea>

              <div class="mt-4 gap-2 flex justify-end">
                <BaseButton
                  type="secondary"
                  @click="closeModal"
                  class="bg-gray-200 dark:bg-dark-500"
                  :disabled="loading"
                >
                  {{ $t("common.cancel") }}
                </BaseButton>

                <BaseButton
                  :type="loading ? 'secondary' : 'primary'"
                  @click="generateEmailBody"
                  :disabled="loading"
                >
                  {{ $t("tool.smartWrite.button") }}
                </BaseButton>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  RadioGroup,
  RadioGroupLabel,
  RadioGroupDescription,
  RadioGroupOption,
} from "@headlessui/vue";

import { useToolStore } from "@/stores/ToolStore";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();

const toolStore = useToolStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const loading = ref(false);

const emailBody = ref("");

const tonalities = computed(() => [
  {
    name: $t("tool.smartWrite.tonality.neutral"),
    type: "neutral",
  },
  {
    name: $t("tool.smartWrite.tonality.professional"),
    type: "professional",
  },
  {
    name: $t("tool.smartWrite.tonality.friendly"),
    type: "friendly",
  },
  {
    name: $t("tool.smartWrite.tonality.apologetic"),
    type: "apologetic",
  },
  {
    name: $t("tool.smartWrite.tonality.thankful"),
    type: "thankful",
  },
  {
    name: $t("tool.smartWrite.tonality.urgent"),
    type: "urgent",
  },
  {
    name: $t("tool.smartWrite.tonality.formal"),
    type: "formal",
  },
  {
    name: $t("tool.smartWrite.tonality.humorous"),
    type: "humorous",
  },
  {
    name: $t("tool.smartWrite.tonality.informative"),
    type: "informative",
  },
  {
    name: $t("tool.smartWrite.tonality.sincere"),
    type: "sincere",
  },
  {
    name: $t("tool.smartWrite.tonality.persuasive"),
    type: "persuasive",
  },
]);

const selected = ref(tonalities.value[0]);

const emits = defineEmits(["close"]);

async function generateEmailBody() {
  try {
    loading.value = true;
    await toolStore
      .generate({
        type: "generateBody",
        content: emailBody.value,
        tonality: selected.value.type,
      })
      .then(() => {
        loading.value = false;
        closeModal();
      });
  } catch (error) {
    loading.value = false;
    console.log(error);
  }
}

function closeModal() {
  if (loading.value) return;
  emits("close");
}
</script>