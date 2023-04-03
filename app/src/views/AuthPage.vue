<script>
import { googleAuthCodeLogin } from "vue3-google-login";
import { useLoginStore } from "@/stores/LoginStore";

export default {
  setup() {
    const loginStore = useLoginStore();
    return {
      loginStore,
    };
  },
  data() {
    return {
      loading: false,
      email: "",
      password: "",
      fname: "",
      lname: "",
    };
  },
  computed: {
    errorMessage() {
      console.log(this.$store.state.errorMessage);
    },
  },
  methods: {
    async login() {
      this.loading = true;
      await googleAuthCodeLogin().then(async (response) => {
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
      });
    },
  },
};
</script>

<template>
  <section class="dark:bg-dark-800 bg-primary-900">
    <!-- <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div class="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-dark-800 border-dark-700">
            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 class="text-xl font-bold leading-tight tracking-tight md:text-2xl text-primary-900">
                  <span v-if="$route.name === 'Login'">Sign in to your account</span>
                  <span v-else>Sign up for a new account</span>
                </h1>
                <form class="space-y-4 md:space-y-6" @submit.prevent="onSubmit">
                    <div class="flex items-center justify-between" v-if="$route.name === 'Register'">
                      <div>
                        <label for="fname" class="block mb-2 text-sm font-medium text-primary-900">First Name</label>
                        <input v-model="fname" type="text" name="fname" id="fname" class="border sm:text-sm rounded-lg block w-full p-2.5 bg-dark-700 border-dark-600 placeholder-dark-400 text-primary-900 focus:ring-blue-500 focus:border-blue-500" placeholder="John" >
                      </div>
                      <div>
                        <label for="lname" class="block mb-2 text-sm font-medium text-primary-900">Last Name</label>
                        <input v-model="lname" type="text" name="lname" id="lname" class="border sm:text-sm rounded-lg focus:ring-primary-600 block w-full p-2.5 bg-dark-700 border-dark-600 placeholder-dark-400 text-primary-900 focus:ring-blue-500 focus:border-blue-500" placeholder="name@company.com" >
                      </div>
                    </div>
                    <div>
                        <label for="email" class="block mb-2 text-sm font-medium text-primary-900">Your email</label>
                        <input v-model="email" type="email" name="email" id="email" class="border sm:text-sm rounded-lg block w-full p-2.5 bg-dark-700 border-dark-600 placeholder-dark-400 text-primary-900 focus:ring-blue-500 focus:border-blue-500" placeholder="name@company.com" >
                    </div>
                    <div>
                        <label for="password" class="block mb-2 text-sm font-medium text-primary-900">Password</label>
                        <input v-model="password" type="password" name="password" id="password" placeholder="••••••••" class="border sm:text-sm rounded-lg block w-full p-2.5 bg-dark-700 border-dark-600 placeholder-dark-400 text-primary-900 focus:ring-blue-500 focus:border-blue-500" >
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                              <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border rounded bg-dark-50 focus:ring-3 bg-dark-700 border-dark-600 focus:ring-primary-600 ring-offset-dark-800" >
                            </div>
                            <div class="ml-3 text-sm">
                              <label for="remember" class="text-dark-300">Remember me</label>
                            </div>
                        </div>
                        <a href="#" class="text-sm font-medium hover:underline text-primary-500 ml-auto">Forgot password?</a>
                    </div>
                    <p>
                      {{ errorMessage }}
                    </p>
                    <button type="submit" class="w-full font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-accent-600 hover:bg-accent-700 focus:ring-primary-800" @click="handleSignIn()" v-if="$route.name === 'Login'">
                        Sign in to your account
                    </button>
                    <button type="submit" class="w-full focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-accent-600 hover:bg-accent-700 focus:ring-primary-800" @click="handleSignUp()" v-if="$route.name === 'Register'">
                        Register
                    </button>
                    <p class="text-sm font-light text-dark-400">
                        <span v-if="$route.name === 'Login'">Don't have an account? </span>
                        <span v-else>Already have an account? </span>
                        <router-link to="/register" class="font-medium hover:underline text-primary-500" v-if="$route.name === 'Login'">Register here
                        </router-link>
                        <router-link to="/login" class="font-medium hover:underline text-primary-500" v-if="$route.name === 'Register'">Sign in here
                        </router-link>
                    </p>
                </form>
            </div>
        </div>
    </div> -->
    <div class="grid place-items-center h-screen">
      <button
        v-ripple="{ center: true }"
        @click="login"
        type="button"
        class="text-primary-900 bg-blue-700 hover:bg-blue-700/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-600/90 inline-flex items-center drop-shadow-blue transition-colors"
      >
        <svg
          aria-hidden="true"
          role="status"
          class="inline w-4 h-4 mr-3 text-primary-900 animate-spin"
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
        {{ $t("auth.loginUsingGoogle") }}
      </button>
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
</style>
