<script>
import { googleAuthCodeLogin } from "vue3-google-login";
import { useLoginStore } from "@/stores/LoginStore";
import { usePreferencesStore } from "@/stores/PreferencesStore";
import AppLogoBlack from "@/assets/icons/mailmate_Logo_Black.svg?url";
import AppLogoWhite from "@/assets/icons/mailmate_Logo_White.svg?url";
import SecurityIllustration from "@/assets/icons/clip-online-security.svg?url";
import { storeToRefs } from "pinia";
import GoogleIcon from "@/assets/icons/Google__G__Logo.svg?url";
import { useHead } from "@vueuse/head";

export default {
  setup() {
    const loginStore = useLoginStore();
    const preferencesStore = usePreferencesStore();
    return {
      loginStore,
      preferencesStore,
      AppLogoBlack,
      AppLogoWhite,
      SecurityIllustration,
      GoogleIcon,
    };
  },
  data() {
    return {
      loading: false,
      email: "",
      password: "",
      fname: "",
      lname: "",
      isDark: storeToRefs(this.preferencesStore).isDark,
    };
  },
  methods: {
    async login() {
      await googleAuthCodeLogin()
        .then(async (response) => {
          this.loading = true;
          try {
            await this.loginStore
              .googleSignIn({ code: response.code })
              .then(() => {
                this.loading = false;
                this.$router.push({ name: "Inbox" });
              });
          } catch (error) {
            this.loading = false;
            console.log(error);
          }
        })
        .catch((error) => {
          this.loading = false;
          console.log(error);
        });
    },
  },
};
</script>

<template>
  <section class="dark:bg-dark-800 bg-primary-800">
    <div class="h-screen flex justify-center items-center gap-14">
      <div
        class="w-1/2 h-screen flex justify-center items-center gap-14 flex-col"
      >
        <div>
          <div>
            <img
              :src="isDark ? AppLogoWhite : AppLogoBlack"
              alt="MailMate"
              class="w-52 drag-none"
            />
            <h2
              class="text-3xl text-black font-extrabold dark:text-primary-900 mt-5"
            >
              Login in to your account
            </h2>
          </div>
          <button
            v-ripple="{ center: true }"
            @click="login"
            type="button"
            class="bg-white font-medium rounded-lg text-base px-5 py-2.5 text-center inline-flex items-center transition-colors border border-accent-800 text-black min-w-max mt-10"
          >
            <svg
              aria-hidden="true"
              role="status"
              class="inline w-4 h-4 mr-3 text-dark-900 animate-spin"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              v-if="loading"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#E5E7EB"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentColor"
              />
            </svg>
            <img
              :src="GoogleIcon"
              alt=""
              class="w-4 h-4 mr-3"
              :class="loading ? 'hidden' : 'inline'"
            />
            {{ $t("auth.loginUsingGoogle") }}
          </button>
        </div>
      </div>
      <div
        class="hidden w-1/2 bg-[#5260d4] h-screen md:flex justify-center items-center gap-14 flex-col"
      >
        <img :src="SecurityIllustration" alt="" class="drag-none w-[35rem]" />
      </div>
    </div>
  </section>
</template>

<style scoped>
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
.drag-none {
  user-drag: none;
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
</style>
