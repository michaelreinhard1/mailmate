<script setup>
import { ref, watch, onMounted } from "vue";
import { TransitionRoot, TransitionChild } from "@headlessui/vue";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import { IconX } from "@tabler/icons-vue";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { useLoginStore } from "@/stores/LoginStore";
import { useEmailStore } from "@/stores/EmailStore";
import { usePreferencesStore } from "@/stores/PreferencesStore";
import { useToolStore } from "@/stores/ToolStore";
import BaseButton from "@/components/BaseButton.vue";
import { IconLogout, IconAlertTriangle, IconHelp } from "@tabler/icons-vue";
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

const isOpen = storeToRefs(componentUtilsStore).clickedSettings;

function closeModal() {
  componentUtilsStore.clickedSettings = false;
}
function openModal() {
  componentUtilsStore.clickedSettings = true;
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
    await loginStore.signOut().then(() => {
      componentUtilsStore.clickedSettings = false;
      router.push({ name: "Login" });
    });
  } catch (error) {
    console.log(error);
  }
};

const openTab = storeToRefs(componentUtilsStore).settingsOpenTab;

const toggleTabs = (tab) => {
  openTab.value = tab;
};

const fullName = ref(
  `${loginStore.getProfile?.fname} ${loginStore.getProfile?.lname}`
);
const appPassword = ref("");

const status = storeToRefs(emailStore).status;

const handleFullName = (event) => {
  fullName.value = event.target.value;
};

const handleAppPassword = (event) => {
  appPassword.value = event.target.value;
};

const appPasswordRequirements = ref(true);

const saveAll = () => {
  const [fname, lname] = fullName.value.split(" ");
  loginStore.saveFullName({
    fname,
    lname,
  });
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
</script>

<template>
  <button
    type="button"
    @click="componentUtilsStore.toggleSettings(0)"
    class="menu-item px-3 py-2 mt-2 max-h-10 rounded-md"
    :class="collapsed ? '' : 'open'"
  >
    <slot name="icon" />
    <slot name="title" />
  </button>
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
                  class="w-4 h-4 cursor-pointer hover:text-primary-500 transition-all"
                  @click="closeModal"
                />
              </div>
              <hr class="dark:border-dark-200 transition-colors" />
              <div class="pl-6 pr-6 pb-6 mt-5 flex gap-10 grow">
                <div
                  class="text-sm text-dark-900 dark:text-primary-900 w-1/3 flex flex-col justify-between"
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
                    <hr class="dark:border-dark-200 transition-colors my-5" />

                    <BaseButton
                      class="w-full dark:bg-dark-500 dark:hover:bg-dark-500/50 flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-800 transition-all text-red-500 font-bold"
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
                      <div
                        class="flex items-center mb-4"
                        @click="preferencesStore.toggleDarkMode(false)"
                      >
                        <input
                          id="light-mode"
                          type="radio"
                          name="theme"
                          class="w-4 h-4 text-accent-900 bg-gray-100 border-gray-300"
                          :checked="!isDark"
                        />
                        <label
                          for="light-mode"
                          class="ml-2 text-sm font-medium text-gray-900 dark:text-primary-900"
                        >
                          {{ $t("settings.general.light") }}
                        </label>
                      </div>
                      <div
                        class="flex items-center"
                        @click="preferencesStore.toggleDarkMode(true)"
                      >
                        <input
                          id="dark-mode"
                          type="radio"
                          name="theme"
                          class="w-4 h-4 text-accent-900 bg-gray-100 border-gray-300"
                          :checked="isDark"
                        />
                        <label
                          for="dark-mode"
                          class="ml-2 text-sm font-medium text-gray-900 dark:text-primary-900"
                        >
                          {{ $t("settings.general.dark") }}
                        </label>
                      </div>
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
                  <div
                    v-if="openTab === 1"
                    class="flex flex-col justify-between h-full"
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
                            {{ loginStore.getProfile?.email }}
                          </span>
                        </div>
                      </div>
                      <label
                        for="full-name"
                        class="mb-2 text-sm font-medium text-gray-900 dark:text-primary-600 inline-block"
                      >
                        {{ $t("settings.profile.fullName") }}
                      </label>
                      <div class="mb-5">
                        <input
                          type="text"
                          id="full-name"
                          class="rounded-md border dark:border-dark-100 border-solid w-full p-2 outline-none"
                          :placeholder="`${loginStore.getProfile?.fname} ${loginStore.getProfile?.lname}`"
                          spellcheck="false"
                          v-model="fullName"
                          @input="handleFullName"
                        />
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
                          <template v-slot:text>
                            <div>
                              <p>
                                Enable two-factor authentication for your Google
                                account by going to
                              </p>
                              <a href="https://myaccount.google.com/security"
                                >myaccount.google.com/security</a
                              >
                              <p>
                                Then, select "Verification in 2 steps" and
                                scroll down to "App passwords".
                              </p>
                              <p>
                                Choose "Email" as the app and "Custom name" as
                                the device, and enter "Flow" as the device name.
                              </p>
                              <p>
                                Finally, click "Generate" to complete the
                                process."
                              </p>
                            </div>
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
                          @input="handleAppPassword"
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
                      <BaseButton type="primary" @click="saveAll()">
                        {{ $t("settings.profile.save") }}
                      </BaseButton>
                    </div>
                  </div>
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
