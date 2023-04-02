<script setup>
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["executeAction"]);

const handleClick = (action) => {
  emit("executeAction", action);
};
</script>

<template>
  <Menu as="div" class="relative inline-block text-left w-full">
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="absolute z-50 mt-2 min-w-[188px] grid origin-bottom-center divide-y divide-red-500 rounded-md bg-primary-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none top-11 dark:bg-dark-500 dark:divide-gray-500 border-solid"
      >
        <div class="py-1">
          <MenuItem
            v-slot="{ active }"
            v-for="item in props.items"
            as="div"
            class="mx-1"
          >
            <router-link
              v-if="item.to"
              :to="item.to"
              class="block px-4 py-2 text-sm w-full text-left transition-colors text-gray-900 dark:text-white hover:bg-primary-800 dark:hover:bg-dark-500/90 border-solid rounded-lg"
            >
              {{ item.name }}
            </router-link>
            <button
              v-else
              class="flex items-center px-4 py-2 text-sm w-full text-left transition-colors dark:text-white hover:bg-primary-800 dark:hover:bg-dark-400/50 border-solid rounded-lg"
              @click="handleClick(item.onClick)"
            >
              {{ item.name }}
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>

    <MenuButton
      class="rounded-md px-3 py-2 mt-2 max-h-10 bg-primary-800 font-bold hover:bg-primary-700 transition-all text-left dark:bg-dark-500 dark:hover:bg-dark-500/50"
    >
      <slot></slot>
    </MenuButton>
  </Menu>
</template>
