<template>
  <div class="search-bar">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAppStore } from "../../../store/appStore";

const appStore = useAppStore();
const searchText = ref("");
const isSearching = ref(false);

const handleSearch = async () => {
  const text = searchText.value.trim();
  if (!text || isSearching.value) return;

  isSearching.value = true;
  try {
    await appStore.searchAllApps(text);
    // 搜索完成后可以清空输入框或保留
    // searchText.value = "";
  } catch (error) {
    console.error("搜索失败:", error);
  } finally {
    // 延迟重置状态，让用户看到搜索完成
    setTimeout(() => {
      isSearching.value = false;
    }, 500);
  }
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

  .search-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 10px;

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
</style>
