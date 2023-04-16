<script setup>
import { ref, watch, onMounted } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  RadioGroup,
  RadioGroupLabel,
  RadioGroupOption,
} from "@headlessui/vue";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import {
  IconX,
  IconCheck,
  IconDownload,
  IconLogout,
  IconAlertTriangle,
  IconHelp,
} from "@tabler/icons-vue";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { useLoginStore } from "@/stores/LoginStore";
import { useEmailStore } from "@/stores/EmailStore";
import { usePreferencesStore } from "@/stores/PreferencesStore";
import { useToolStore } from "@/stores/ToolStore";
import BaseButton from "@/components/BaseButton.vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useComponentUtilsStore } from "@/stores/ComponentUtilsStore";
import GoogleIcon from "@/assets/icons/Google__G__Logo.svg?url";

const router = useRouter();

const loginStore = useLoginStore();
const emailStore = useEmailStore();
const preferencesStore = usePreferencesStore();
const toolStore = useToolStore();

const isDark = storeToRefs(preferencesStore).isDark;

const componentUtilsStore = useComponentUtilsStore();

const locale = storeToRefs(preferencesStore).locale;

watch(locale, (newLocale) => {
  preferencesStore.setLocale(newLocale);
});

onMounted(() => {
  preferencesStore.setLocale(locale.value);
});

const { t: $t } = useI18n();

const props = defineProps({
  collapsed: {
    type: Boolean,
  },
});

const isOpen = storeToRefs(componentUtilsStore).showSettings;

function closeModal() {
  componentUtilsStore.showSettings = false;
}

const sideBarItems = computed(() => [
  {
    name: $t("settings.general.title"),
  },
  {
    name: $t("settings.profile.title"),
  },
  {
    name: $t("settings.AItools.title"),
  },
]);

const tools = storeToRefs(toolStore).AItools;

const AItools = computed(() => {
  return tools.value.map((tool) => {
    return {
      name: $t(`tool.${tool.name}.title`),
      description: $t(`tool.${tool.name}.description`),
      icon: tool.icon,
      enabled: tool.enabled,
      alpha: tool.alpha,
    };
  });
});

const toggleAItool = (id) => {
  toolStore.toggleAItool(id);
};

const signOut = async () => {
  try {
    await loginStore.signOut();
    componentUtilsStore.showSettings = false;
    router.push({ name: "Login" });
  } catch (error) {
    console.log(error);
  }
};

const openTab = storeToRefs(componentUtilsStore).settingsOpenTab;

const toggleTabs = (tab) => {
  openTab.value = tab;
};

const fullName = ref(`${loginStore.profile?.name}`);
const appPassword = ref("");

const status = storeToRefs(emailStore).status;

const appPasswordRequirements = ref(true);

const loading = ref(false);

const userCanSave = computed(() => {
  return (
    fullName.value !== loginStore.profile?.name ||
    appPassword.value !== "" ||
    appPasswordRequirements.value === false
  );
});

const saveAll = () => {
  loading.value = true;
  if (fullName.value !== loginStore.profile?.name) {
    loginStore.saveFullName({
      name: fullName.value,
    });
  }
  if (appPassword.value !== "") {
    if (appPassword.value.length === 16) {
      appPasswordRequirements.value = true;
      emailStore.saveAppPassword({
        password: appPassword.value,
      });
      appPassword.value = "";
    } else {
      appPasswordRequirements.value = false;
    }
  }
};
const themes = [
  {
    name: $t("settings.general.light"),
    dark: false,
  },
  {
    name: $t("settings.general.dark"),
    dark: true,
  },
];

const selected = ref(themes[isDark.value ? 1 : 0]);

watch(selected, (newTheme) => {
  preferencesStore.toggleDarkMode(newTheme.dark);
});

const checkTauri = () => {
  const tauri = preferencesStore.tauri;
  if (tauri) {
    return true;
  } else {
    return false;
  }
};
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <div @close="closeModal" class="relative z-[51]">
      <TransitionChild
        as="template"
        enter="duration-150 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex items-center justify-center text-center min-h-full">
          <TransitionChild
            as="template"
            enter="duration-150 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <div
              class="w-full max-w-3xl transform overflow-hidden rounded-lg bg-primary-900 text-left align-middle shadow-xl transition-all min-h-[65vh] dark:bg-dark-400 flex flex-col"
              v-click-outside="closeModal"
            >
              <div
                class="top flex justify-between text-lg font-medium leading-6 text-gray-900 mb-5 pt-6 pl-6 pr-6 dark:text-primary-900"
              >
                <span class="px-3">
                  {{ $t("nav.settings") }}
                </span>
                <IconX
                  class="w-4 h-4 cursor-pointer dark:hover:text-primary-500 transition-colors hover:text-dark-200"
                  @click="closeModal"
                />
              </div>
              <hr class="dark:border-dark-200 transition-colors" />
              <div class="pl-6 pr-6 pb-6 mt-5 flex gap-10 grow">
                <div
                  class="text-sm text-dark-900 dark:text-primary-900 min-w-max w-1/3 flex flex-col justify-between"
                >
                  <ul class="mt-0">
                    <li
                      v-for="(item, index) in sideBarItems"
                      :key="item.name"
                      class="mb-2 rounded-md px-3 py-2 hover:bg-primary-800 transition-all cursor-pointer dark:hover:bg-dark-200"
                      :class="
                        openTab === index
                          ? 'bg-primary-800 dark:bg-dark-200'
                          : ''
                      "
                      @click="toggleTabs(index)"
                    >
                      <a
                        class="flex items-center gap-2 font-bold"
                        :class="
                          openTab === index
                            ? 'text-accent-900 dark:text-white'
                            : ''
                        "
                      >
                        {{ item.name }}
                      </a>
                    </li>
                  </ul>

                  <div>
                    <a
                      v-if="!checkTauri()"
                      class="w-full dark:bg-dark-500 dark:hover:bg-dark-500/50 flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-800 transition-all font-bold rounded-lg px-3 py-2"
                      download
                      href="tauri/mailmate_1.0.0_x64.msi"
                      v-ripple="{ center: true }"
                    >
                      <IconDownload class="w-4 h-4" />
                      {{ $t("tauri.downloadDesktopApp") }}
                    </a>
                    <hr class="dark:border-dark-200 transition-colors my-5" />

                    <BaseButton
                      class="w-full dark:bg-dark-500 dark:hover:bg-dark-500/50 flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-800 transition-all font-bold"
                      @click="signOut"
                    >
                      <IconLogout class="w-4 h-4" />
                      {{ $t("settings.signOut") }}
                    </BaseButton>
                  </div>
                </div>
                <div class="w-full pl-6 dark:text-primary-900 grow">
                  <div v-if="openTab === 0">
                    <div>
                      <div class="tab-section">
                        {{ $t("settings.general.theme") }}
                      </div>
                    </div>
                    <div>
                      <RadioGroup v-model="selected" as="div">
                        <RadioGroupLabel class="sr-only">
                          {{ $t("settings.general.theme") }}
                        </RadioGroupLabel>
                        <div class="w-fit flex gap-5">
                          <RadioGroupOption
                            as="template"
                            v-for="theme in themes"
                            :key="theme.name"
                            :value="theme"
                            v-slot="{ active, checked }"
                          >
                            <div
                              :class="[
                                active ? ' ' : '',
                                checked ? 'border-accent-900' : '',
                                theme.dark ? 'bg-dark-900' : 'bg-white',
                              ]"
                              class="relative p-6 aspect-square rounded-full border-2 cursor-pointer"
                            >
                              <div
                                class="flex w-full items-center justify-between"
                                v-show="checked"
                              >
                                <div
                                  class="shrink-0 text-white absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/3"
                                >
                                  <div class="bg-accent-700 rounded-full p-1">
                                    <IconCheck class="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </RadioGroupOption>
                        </div>
                      </RadioGroup>
                    </div>
                    <hr class="my-5 dark:border-dark-200 transition-colors" />
                    <div>
                      <div class="tab-section">
                        {{ $t("settings.general.language") }}
                      </div>
                    </div>
                    <div>
                      <LanguageSwitcher />
                    </div>
                  </div>
                  <form
                    v-if="openTab === 1"
                    class="flex flex-col justify-between h-full text-sm"
                  >
                    <div>
                      <div class="mb-5">
                        <div
                          class="rounded-md dark:bg-dark-500 w-full p-2 outline-none bg-primary-800"
                        >
                          <span
                            class="text-[#9ca3af] hover:cursor-default flex items-center gap-2 text-sm font-medium"
                          >
                            <img
                              :src="GoogleIcon"
                              class="w-4 h-4 object-cover"
                            />
                            {{ loginStore.profile?.email }}
                          </span>
                        </div>
                      </div>

                      <div class="flex justify-between">
                        <label
                          for="full-name"
                          class="mb-2 text-sm font-medium text-gray-900 dark:text-primary-600 inline-block"
                        >
                          {{ $t("settings.profile.fullName") }}
                        </label>
                      </div>
                      <div class="mb-5">
                        <input
                          type="text"
                          id="full-name"
                          class="rounded-md border dark:border-dark-100 border-solid w-full p-2 outline-none"
                          spellcheck="false"
                          v-model="fullName"
                        />
                        <div
                          class="mt-2 text-xs text-gray-500 dark:text-primary-600"
                        >
                          {{
                            $t("settings.profile.thisNameIsUsedAsTheSenderName")
                          }}
                        </div>
                      </div>
                      <div class="flex justify-between">
                        <label
                          for="app-password"
                          class="mb-2 text-sm font-medium text-gray-900 dark:text-primary-600 inline-block"
                        >
                          {{ $t("settings.profile.appPassword") }}
                        </label>
                        <v-tooltip
                          text="support.google.com"
                          close-delay="100"
                          open-delay="100"
                          location="bottom"
                        >
                          <template v-slot:activator="{ props }">
                            <a
                              href="https://support.google.com/accounts/answer/185833"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="outline-none"
                            >
                              <IconHelp v-bind="props" class="w-4 h-4" />
                            </a>
                          </template>
                        </v-tooltip>
                      </div>
                      <div class="mb-4 relative">
                        <input
                          type="password"
                          id="app-password"
                          class="rounded-md border border-solid w-full p-2 outline-none transition-colors"
                          placeholder="••••••••••••••••"
                          v-model="appPassword"
                          maxlength="16"
                          minlength="16"
                          :class="
                            !appPasswordRequirements
                              ? 'border-red-500'
                              : 'dark:border-dark-100'
                          "
                        />
                        <div
                          v-if="!appPasswordRequirements"
                          class="text-red-500 mt-2"
                        >
                          {{
                            $t("settings.profile.passwordMinChars", {
                              number: 16,
                            })
                          }}
                        </div>
                      </div>
                      <span>
                        {{ $t("settings.profile.status") }}:
                        <span
                          class="text-green-500"
                          v-if="status === 'connected'"
                        >
                          {{ $t("settings.profile.connected") }}
                        </span>
                        <span
                          class="text-blue-500"
                          v-if="status === 'connecting'"
                        >
                          {{ $t("settings.profile.connecting") }}...
                        </span>
                        <span
                          class="text-red-500"
                          v-if="status === 'disconnected'"
                        >
                          {{ $t("settings.profile.disconnected") }}
                        </span>
                      </span>
                    </div>
                    <div class="buttons ml-auto flex gap-2">
                      <BaseButton
                        type="primary"
                        @click="saveAll()"
                        :loading="loading"
                        :disabled="!userCanSave"
                      >
                        {{ $t("settings.profile.save") }}
                      </BaseButton>
                    </div>
                  </form>
                  <div
                    v-if="openTab === 2"
                    class="flex flex-col justify-between h-full"
                  >
                    <div>
                      <div class="mb-5">
                        <div
                          class="bg-primary-800 dark:bg-dark-700 dark:text-primary-500 font-bold py-2 px-4 flex items-center text-sm w-full outline-none rounded-md"
                        >
                          <IconAlertTriangle class="w-4 h-4 mr-2" />
                          {{ $t("tool.AIresponseAlert") }}
                        </div>
                      </div>
                      <div v-for="(item, key) in AItools" :key="key">
                        <!-- name and button to enable or disbale it -->
                        <div class="flex items-center justify-between mb-5">
                          <div class="w-2/3">
                            <div
                              class="text-sm font-bold text-gray-900 dark:text-primary-600"
                            >
                              {{ item.name }}
                            </div>
                            <div v-if="item.alpha" class="my-2">
                              <span class="alpha">
                                {{ $t("tool.alpha") }}
                              </span>
                            </div>
                            <div
                              class="text-sm font-medium text-gray-500 dark:text-primary-500 mt-2"
                            >
                              {{ item.description }}
                            </div>
                          </div>
                          <div>
                            <BaseButton
                              :type="item.enabled ? 'secondary' : 'primary'"
                              @click="toggleAItool(key)"
                            >
                              {{
                                item.enabled
                                  ? $t("common.disable")
                                  : $t("common.enable")
                              }}
                            </BaseButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </div>
  </TransitionRoot>
</template>

<style scoped>
.tab-section {
  @apply text-sm font-medium leading-6 text-gray-900 mb-3 dark:text-primary-900;
}
</style>
