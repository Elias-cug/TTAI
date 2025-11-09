<template>
  <div class="search-bar">
    <!-- AI 应用图标列表 -->
    <div class="app-icons-container">
      <div
        class="app-icon-item"
        v-for="app in aiAppList"
        :key="app.id"
        @click="onClickApp(app)"
        @mouseenter="showTooltip(app, $event)"
        @mouseleave="hideTooltip"
      >
        <img :src="app.logo" :alt="app.name" />
      </div>
    </div>

    <div class="search-container-divider"></div>
    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <svg
          class="search-icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M14 14L11.1 11.1"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <input
          v-model="searchText"
          type="text"
          class="search-input"
          placeholder="输入问题，一键搜索所有 AI 应用..."
          @keydown.enter="handleSearch"
        />
      </div>
      <button
        class="search-button"
        :disabled="!searchText.trim() || isSearching"
        @click="handleSearch"
      >
        <span v-if="!isSearching">搜索</span>
        <span v-else class="loading">搜索中</span>
      </button>
    </div>

    <!-- Tooltip - 使用 Teleport 渲染到 body -->
    <Teleport to="body">
      <div
        v-if="tooltip.show"
        class="tooltip"
        :style="{
          top: tooltip.top + 'px',
          left: tooltip.left + 'px',
        }"
      >
        {{ tooltip.text }}
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useAppStore } from "../../../store/appStore";
import { AIAppList } from "./const";
import type { App } from "../../../store/appStore";

const appStore = useAppStore();
const searchText = ref("");
const isSearching = ref(false);
const aiAppList = ref(AIAppList);

const tooltip = reactive({
  show: false,
  text: "",
  top: 0,
  left: 0,
});

const handleSearch = async () => {
  const text = searchText.value.trim();
  if (!text || isSearching.value) return;

  console.log("🔍 [SearchBar] 开始搜索:", text);
  isSearching.value = true;
  try {
    await appStore.searchAllApps(text);
    console.log("✅ [SearchBar] 搜索请求已发送");
    // 搜索完成后可以清空输入框或保留
    // searchText.value = "";
  } catch (error) {
    console.error("❌ [SearchBar] 搜索失败:", error);
  } finally {
    // 延迟重置状态，让用户看到搜索完成
    setTimeout(() => {
      isSearching.value = false;
    }, 500);
  }
};

const onClickApp = (app: App) => {
  // 检查是否已有该应用的 tab 打开
  if (appStore.isTabOpen(app.id)) {
    // 如果已打开，找到对应的 tab 并激活
    const existingTab = appStore.getTabs.find(
      (tab: any) => tab.app.id === app.id
    );
    if (existingTab) {
      appStore.switchTab(existingTab.id);
    }
  } else {
    // 如果未打开，添加新的 tab
    appStore.addTab(app);
  }
};

const showTooltip = (app: App, event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  
  tooltip.text = app.name;
  tooltip.top = rect.bottom + 8; // 在图标下方8px
  tooltip.left = rect.left + rect.width / 2; // 居中点位置，CSS transform 会处理偏移
  tooltip.show = true;
};

const hideTooltip = () => {
  tooltip.show = false;
};
</script>

<style scoped lang="scss">
.search-bar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  gap: 16px;

  .app-icons-container {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    overflow-y: hidden;
    flex-shrink: 0;
    padding: 4px 0;
    max-width: 50%;
    
    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #d0d0d0;
      border-radius: 2px;

      &:hover {
        background-color: #b0b0b0;
      }
    }

    .app-icon-item {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 8px;
      background-color: #ffffff;
      transition: all 0.2s;
      flex-shrink: 0;
      padding: 2px;

      &:hover {
        background-color: #f0f4f8;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(74, 144, 226, 0.15);
      }

      &:active {
        transform: translateY(0);
      }

      img {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        transition: transform 0.2s;
      }
    }
  }

  .search-container-divider {
    width: 1px;
    height: 30px;
    background-color: rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  .search-container {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 1000px;
    max-width: 50%;
    flex-shrink: 0;

    .search-input-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      background-color: rgba(142, 142, 147, 0.12);
      border-radius: 10px;
      border: 0.5px solid transparent;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:focus-within {
        background-color: rgba(255, 255, 255, 1);
        border-color: rgba(0, 122, 255, 0.3);
        box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
      }

      .search-icon {
        position: absolute;
        left: 14px;
        color: rgba(142, 142, 147, 0.8);
        pointer-events: none;
        transition: color 0.2s ease;
      }

      &:focus-within .search-icon {
        color: rgba(0, 122, 255, 0.6);
      }

      .search-input {
        flex: 1;
        height: 44px;
        padding: 0 14px 0 40px;
        border: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 400;
        color: #000000;
        background-color: transparent;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        outline: none;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
          "Helvetica Neue", Helvetica, Arial, sans-serif;
        letter-spacing: -0.01em;

        &::placeholder {
          color: rgba(142, 142, 147, 0.6);
          font-weight: 400;
        }

        &:focus {
          &::placeholder {
            color: rgba(142, 142, 147, 0.4);
          }
        }
      }
    }

    .search-button {
      height: 44px;
      padding: 0 20px;
      border: none;
      border-radius: 10px;
      background-color: #007aff;
      color: #ffffff;
      font-size: 15px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
        "Helvetica Neue", Helvetica, Arial, sans-serif;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      letter-spacing: -0.01em;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &:hover:not(:disabled) {
        background-color: #0051d5;
        box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
        transform: translateY(-0.5px);
      }

      &:active:not(:disabled) {
        background-color: #0040a8;
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      }

      &:disabled {
        background-color: rgba(142, 142, 147, 0.3);
        color: rgba(142, 142, 147, 0.6);
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
      }

      .loading {
        display: inline-flex;
        align-items: center;
        gap: 4px;

        &::after {
          content: "";
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: rgba(255, 255, 255, 1);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tooltip {
  position: fixed;
  background-color: rgba(44, 62, 80, 0.95);
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 999999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transform: translateX(-50%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: tooltipFadeIn 0.15s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  letter-spacing: -0.01em;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
