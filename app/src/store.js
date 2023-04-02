import axios from "axios";
import Vuex from "vuex";
import { createStore } from "vuex";

// api.defaults.headers.common['x-access-token'] = `${JSON.parse(localStorage.getItem('profile')).token}`
const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api/` });

const auth = {
  state: {
    profile: {},
    isLoggedIn: false,
    errorMessage: "",
  },
  mutations: {
    setProfile(state, profile) {
      state.profile = profile;
    },
    setIsLoggedIn(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn;
    },
    setErrorMessage(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
  },
  actions: {
    init({ commit }) {
      const profile = JSON.parse(localStorage.getItem("profile"));
      if (profile) {
        commit("setProfile", profile);
        commit("setIsLoggedIn", true);
        api.defaults.headers.common["x-access-token"] = `${profile.token}`;
      }
    },
    async signIn({ commit }, { email, password }) {
      try {
        const response = await api.post(
          `/auth/signin`,
          {
            email: email,
            password: password,
          },
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );
        localStorage.setItem("profile", JSON.stringify(response.data));
        commit("setProfile", response.data.profile);
        commit("setIsLoggedIn", true);
      } catch (error) {
        console.log(error.response.data.message);
        commit("setErrorMessage", error.response.data.message);
      }
    },
    async googleSignIn({ commit }, { code }) {
      try {
        const response = await api.post(
          `/auth/signin/google`,
          {
            code,
          },
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );
        localStorage.setItem("profile", JSON.stringify(response.data));
        commit("setProfile", response.data.profile);
        commit("setIsLoggedIn", true);
      } catch (error) {
        console.log(error);
      }
    },
    async saveAppPassword({ commit }, { password }) {
      try {
        await api
          .post(
            `/email/app-password`,
            {
              password,
            },
            {
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
          )
          .then((res) => {
            console.log(res);
          });
        commit("setIsLoggedIn", true);
      } catch (error) {
        console.log(error);
      }
    },
    async signUp({ commit }, { fname, lname, email, password }) {
      try {
        const response = await api.post(
          `/auth/signup`,
          {
            fname: fname,
            lname: lname,
            email: email,
            password: password,
          },
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );
        localStorage.setItem("profile", JSON.stringify(response.data));
        commit("setProfile", response.data.profile);
        commit("setIsLoggedIn", true);
      } catch (error) {
        console.log(error);
      }
    },
    async signOut({ commit }) {
      localStorage.removeItem("profile");
      commit("setProfile", {});
      commit("setIsLoggedIn", false);
    },
  },
};

const email = {
  actions: {
    async sendEmail({ commit }, { to, subject, body }) {
      await api
        .post(
          `/email/send`,
          {
            to,
            subject,
            body,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {})
        .catch((error) => {
          console.log(error);
        });
    },
    async getEmails({ commit }, { page }) {
      return await api
        .post(
          `/email/get`,
          {
            page,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          return {
            emails: response.data.emails,
            totalEmails: response.data.totalEmails,
            message: "Emails fetched successfully",
          };
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};

const ai = {
  actions: {
    async generate({ commit }, { content, type }) {
      return await api
        .post(
          `/ai/email/${type}`,
          {
            content,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          return error;
        });
    },
  },
};

const store = createStore({
  modules: {
    auth,
    email,
    ai,
  },
});

export default store;
