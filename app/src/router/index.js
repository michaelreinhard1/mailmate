import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import { useLoginStore } from "@/stores/LoginStore";

const pinia = createPinia();

const Authroutes = [
  {
    path: "/",
    name: "Login",
    component: () => import("@/views/AuthPage.vue"),
  },
  {
    path: "/auht/google",
    name: "GoogleAuth",
  },
  {
    path: "/setup",
    name: "Setup",
    component: () => import("@/views/SetupPage.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/SettingsPage.vue"),
    meta: {
      requiresAuth: true,
    },
  },
];

const emailRoutes = [
  {
    path: "/inbox",
    name: "Inbox",
    components: {
      default: () => import("@/views/EmailPage.vue"),
    },
    children: [
      {
        path: ":uid",
        name: "InboxEmail",
        components: {
          default: () => import("@/views/Email/Detail.vue"),
        },
      },
    ],
    meta: {
      requiresAuth: true,
      box: "INBOX",
    },
  },
  {
    path: "/starred",
    name: "Starred",
    components: {
      default: () => import("@/views/EmailPage.vue"),
    },
    children: [
      {
        path: ":uid",
        name: "StarredEmail",
        components: {
          default: () => import("@/views/Email/Detail.vue"),
        },
      },
    ],
    meta: {
      requiresAuth: true,
      box: "STARRED",
    },
  },
  {
    path: "/sent",
    name: "Sent",
    components: {
      default: () => import("@/views/EmailPage.vue"),
    },
    children: [
      {
        path: ":uid",
        name: "SentEmail",
        components: {
          default: () => import("@/views/Email/Detail.vue"),
        },
      },
    ],
    meta: {
      requiresAuth: true,
      box: "SENT",
    },
  },
  {
    path: "/drafts",
    name: "Drafts",
    components: {
      default: () => import("@/views/EmailPage.vue"),
    },
    children: [
      {
        path: ":uid",
        name: "DraftsEmail",
        components: {
          default: () => import("@/views/Email/Detail.vue"),
        },
      },
    ],
    meta: {
      requiresAuth: true,
      box: "DRAFTS",
    },
  },
  {
    path: "/trash",
    name: "Trash",
    components: {
      default: () => import("@/views/EmailPage.vue"),
    },
    children: [
      {
        path: ":uid",
        name: "TrashEmail",
        components: {
          default: () => import("@/views/Email/Detail.vue"),
        },
      },
    ],
    meta: {
      requiresAuth: true,
      box: "TRASH",
    },
  },
  {
    path: "/spam",
    name: "Spam",
    components: {
      default: () => import("@/views/EmailPage.vue"),
    },
    children: [
      {
        path: ":uid",
        name: "SpamEmail",
        components: {
          default: () => import("@/views/Email/Detail.vue"),
        },
      },
    ],
    meta: {
      requiresAuth: true,
      box: "SPAM",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [...Authroutes, ...emailRoutes],
  linkActiveClass: "active-link",
});

router.beforeEach(async (to, from, next) => {
  // Redirect to Inbox if no route is matched

  if (to.matched.length === 0) {
    next({ name: "Inbox" });
  }

  const loginStore = useLoginStore(pinia);

  const verifyToken = loginStore.verifyToken;
  const setup = loginStore.setup;

  if (to.name === "Login") {
    try {
      await verifyToken();
      if (setup && to.name !== "Setup") next({ name: "Setup" });
      else next({ name: "Inbox" });
    } catch (error) {
      next();
    }
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    try {
      await verifyToken();
      if (setup && to.name !== "Setup") next({ name: "Setup" });
      else next();
    } catch (error) {
      next({ name: "Login" });
    }
  }
});

export default router;
