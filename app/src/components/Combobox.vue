<script setup>
import { usePreferencesStore } from "@/stores/PreferencesStore";
import { computed } from "vue";

const preferencesStore = usePreferencesStore();

const isDark = computed(() => preferencesStore.isDark);
</script>

<template>
  <v-combobox id="combobox" :theme="isDark ? 'dark' : 'light'">
    <template v-slot:selection="{ attrs, item, select, selected }">
      <v-chip
        v-bind="attrs"
        :model-value="selected"
        closable
        @click="select"
        @click:close="remove(item)"
      >
        <strong>{{ item }}</strong>
      </v-chip>
    </template>
  </v-combobox>
</template>

<style lang="scss" scoped>
@use "../plugins/settings";

#combobox {
  ::v-field--variant-solo {
    // your custom css properties
    // remove shadow
    box-shadow: none;
  }
}
#combobox {
  .v-chip {
    background-color: #3f51b5;
    color: #fff;
  }
}
</style>
