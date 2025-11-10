<template>
  <div class="main">
    <SearchBar class="search-bar-wrapper" />
    <div class="split-layout-wrapper">
      <SplitLayout :pane="splitLayout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SearchBar from "./components/SearchBar.vue";
import SplitLayout from "./components/SplitLayout.vue";
import { useAppStore } from "../../store/appStore";

const appStore = useAppStore();
const splitLayout = computed(() => appStore.getSplitLayout);
</script>

<style scoped lang="scss">
.main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;

  .search-bar-wrapper {
    flex-shrink: 0;
  }

  .split-layout-wrapper {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    background-color: #ffffff;
  }
}
</style>
