<script>
import { useEmailStore } from "@/stores/EmailStore";
import { useLoginStore } from "@/stores/LoginStore";
import { storeToRefs } from "pinia";
import BaseButton from "@/components/BaseButton.vue";
import { useToast } from "vue-toastification";
import { IconLogout } from "@tabler/icons-vue";

export default {
  setup() {
    const emailStore = useEmailStore();
    const loginStore = useLoginStore();
    const toast = useToast();
    return {
      emailStore,
      loginStore,
      toast,
    };
  },
  data() {
    return {
      loading: false,
      appPassword: "",
      appPasswordRequirements: true,
      status: storeToRefs(this.emailStore).status,
      currentStep: 1,
    };
  },
  components: {
    BaseButton,
    IconLogout,
  },
  computed: {
    steps() {
      return [
        {
          title: this.$t("setup.step1.title"),
          subSteps: [
            {
              title: this.$t("setup.step1.subSteps[0].title"),
            },
            {
              title: this.$t("setup.step1.subSteps[1].title"),
            },
            {
              title: this.$t("setup.step1.subSteps[2].title"),
            },
          ],
        },
        {
          title: this.$t("setup.step2.title"),
          subSteps: [
            {
              title: this.$t("setup.step2.subSteps[0].title"),
            },
            {
              title: this.$t("setup.step2.subSteps[1].title"),
            },
            {
              title: this.$t("setup.step2.subSteps[2].title"),
            },
            {
              title: this.$t("setup.step2.subSteps[3].title"),
            },
          ],
        },
        {
          title: this.$t("setup.step3.title"),
        },
      ];
    },
  },
  methods: {
    async saveAppPassword() {
      if (this.appPassword !== "") {
        if (this.appPassword.length === 16) {
          this.appPasswordRequirements = true;
          try {
            await this.loginStore
              .saveAppPassword({
                password: this.appPassword,
              })
              .then(() => {
                this.$router.push({ name: "Inbox" });
              });
          } catch (error) {
            console.log(error);
          }
        } else {
          this.appPasswordRequirements = false;
        }
      } else {
        this.appPasswordRequirements = false;
      }
    },
    async signOut() {
      try {
        await this.loginStore.signOut();
        this.$router.push({ name: "Login" });
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<template>
  <div
    class="mx-auto md:grid md:place-items-center h-screen dark:bg-dark-900 bg-primary-800 flex justify-center items-center"
  >
    <div
      class="bg-primary-900 dark:bg-dark-800 shadow-lg flex rounded-xl h-[500px] dark:text-white min-w-fit w-[1000px] m-4"
    >
      <!-- Step indicator with dots and line -->
      <div
        class="hidden md:flex flex-col justify-between items-center dark:bg-dark-700 w-fit rounded-l-xl dark:border-dark-600 border-r"
      >
        <div class="flex flex-col justify-between h-full p-4">
          <div>
            <div
              v-for="(item, index) in steps"
              :key="item.title"
              class="flex items-center hover:cursor-pointer relative px-4 transition-all rounded-md mb-2 dark:hover:bg-dark-400 hover:bg-primary-800"
              :class="{
                'dark:bg-dark-400 bg-primary-800': index + 1 === currentStep,
                'dark:bg-dark-700 ': index + 1 !== currentStep,
              }"
              @click="currentStep = index + 1"
            >
              <!-- Set class bg-blue-500 if index+1 is equal to currentStep and all of the below -->
              <div
                class="w-6 h-6 border-2 rounded-full m-4 ml-0 transition-all flex items-center justify-center z-10 p-3 text-sm"
                :class="{
                  'border-accent-900': index + 1 === currentStep,
                  'border-gray-500': index + 1 !== currentStep,
                }"
              >
                {{ index + 1 }}
                <!-- <div class="w-2 h-2 rounded-full" :class="{'bg-primary-900': index+1 === currentStep}"></div> -->
              </div>
              <!-- Dotted line to conncect the steps -->
              <div
                class="transition-all text-sm min-w-max"
                :class="
                  ({ 'text-blue-500': index + 1 === currentStep },
                  { 'text-primary-900-500': index < currentStep })
                "
              >
                {{ item.title }}
              </div>
            </div>
          </div>

          <div>
            <BaseButton
              class="w-full dark:bg-dark-500 dark:hover:bg-dark-500/50 flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-800 transition-all text-red-500"
              @click="signOut"
            >
              <IconLogout class="w-4 h-4" />
              {{ $t("settings.signOut") }}
            </BaseButton>
          </div>
        </div>
        <!-- <BaseButton v-if="currentStep !== step.length" @click="currentStep = step.length" class="text-blue-500 py-2 px-4 rounded text-sm text-left" type="BaseButton">
          <span>Already have an app password?</span>
        </BaseButton> -->
      </div>

      <div
        class="md:py-4 md:px-8 flex flex-col justify-between md:w-3/4 m-5 w-full"
      >
        <div>
          <div v-if="currentStep === 1">
            <h2>
              {{ $t("setup.step1.title") }}
            </h2>
            <ul>
              <li v-for="(item, index) in steps[0].subSteps" :key="item.title">
                <div v-html="item.title"></div>
              </li>
            </ul>
          </div>
          <div v-if="currentStep === 2">
            <h2>
              {{ $t("setup.step2.title") }}
            </h2>
            <ul>
              <li v-for="(item, index) in steps[1].subSteps" :key="item.title">
                <div v-html="item.title"></div>
              </li>
            </ul>
          </div>
          <div v-if="currentStep === 3" class="text-sm">
            <h2 class="mb-10">
              {{ $t("setup.step3.title") }}
            </h2>
            <label
              for="app-password"
              class="mb-2 font-medium text-gray-900 dark:text-primary-600 inline-block"
            >
              {{ $t("settings.profile.appPassword") }}
            </label>
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
              <div v-if="!appPasswordRequirements" class="text-red-500 mt-2">
                {{
                  $t("settings.profile.passwordMinChars", {
                    number: 16,
                  })
                }}
              </div>
            </div>
            <span>
              {{ $t("settings.profile.status") }}:
              <span class="text-green-500" v-if="status === 'connected'">
                {{ $t("settings.profile.connected") }}
              </span>
              <span class="text-blue-500" v-if="status === 'connecting'">
                {{ $t("settings.profile.connecting") }}...
              </span>
              <span class="text-red-500" v-if="status === 'disconnected'">
                {{ $t("settings.profile.disconnected") }}
              </span>
            </span>
          </div>
        </div>
        <div class="flex justify-between mt-auto">
          <button
            v-if="currentStep !== 1"
            @click="currentStep--"
            class="bg-transparent py-2 rounded-lg text-sm text-gray-600 dark:text-primary-600"
            type="button"
          >
            {{ $t("common.previous") }}
          </button>
          <BaseButton
            v-if="currentStep !== steps.length"
            @click="currentStep++"
            class="ml-auto"
            :disabled="loading"
          >
            {{ $t("common.next") }}
          </BaseButton>
          <BaseButton
            v-else
            :loading="loading"
            class="ml-auto"
            @click="saveAppPassword()"
          >
            {{ $t("settings.profile.save") }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h2 {
  @apply text-2xl text-center leading-relaxed font-bold mt-4;
}
ul {
  @apply mt-10 divide-y divide-gray-200 dark:divide-dark-400;
}
li {
  @apply py-5;
}

.drop-shadow-blue {
  box-shadow: 0px 0px 7.8px rgba(48, 97, 241, 0.015),
    0px 0px 17.2px rgba(48, 97, 241, 0.022),
    0px 0px 28.8px rgba(48, 97, 241, 0.027),
    0px 0px 43.4px rgba(48, 97, 241, 0.031),
    0px 0px 62.6px rgba(48, 97, 241, 0.035),
    0px 0px 88.6px rgba(48, 97, 241, 0.039),
    0px 0px 125.7px rgba(48, 97, 241, 0.043),
    0px 0px 182.5px rgba(48, 97, 241, 0.048),
    0px 0px 281.3px rgba(48, 97, 241, 0.055),
    0px 0px 500px rgba(48, 97, 241, 0.07);
}
</style>
