<template>
  <div class="main">
    <SideBar class="side-bar-wrapper" />
    <div class="content-wrapper">
      <SearchBar class="search-bar-wrapper" />
      <TabBar class="tab-bar-wrapper" />
      <div class="split-layout-wrapper">
        <SplitLayout :pane="splitLayout" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SideBar from "./components/SideBar.vue";
import SearchBar from "./components/SearchBar.vue";
import TabBar from "./components/TabBar.vue";
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
  background-color: #f5f5f5;
  overflow: hidden;

  .side-bar-wrapper {
    width: 50px;
    height: 100%;
    border-right: 1px solid #e0e0e0;
    flex-shrink: 0;
    background-color: #ffffff;
  }

  .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    background-color: #ffffff;

    .search-bar-wrapper {
      flex-shrink: 0;
    }

    .tab-bar-wrapper {
      flex-shrink: 0;
    }

    .split-layout-wrapper {
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }
  }
}
</style>
