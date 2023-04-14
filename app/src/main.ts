import { createApp } from "vue";
import { createPinia } from "pinia";
import vue3GoogleLogin from "vue3-google-login";
import App from "./App.vue";
import "./style.css";
import router from "./router";
import i18n from "./i18n";
import { createHead } from "@vueuse/head";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import vuetify from "./plugins/vuetify";
import FileIconPlugin from "./plugins/FileIcon/FileIconPlugin";

const head = createHead();

const pinia = createPinia();

const app = createApp(App);

const options = {
  position: "bottom-center",
  timeout: 5048,
  closeOnClick: false,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  draggable: false,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: true,
  closeButton: "button",
  rtl: false,
};

app.use(head);
app.use(pinia);
app.use(router);
app.use(vue3GoogleLogin, { clientId: `${import.meta.env.VITE_CLIENT_ID}` });
app.use(vuetify);
app.use(Toast, options);
app.use(i18n);
app.use(FileIconPlugin);
app.mount("#app");

export default app;
