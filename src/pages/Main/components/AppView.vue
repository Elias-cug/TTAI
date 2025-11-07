<template>
  <div class="app-view" v-if="tab">
    <div class="app-view-header">
      <div class="header-left">
        <img :src="tab.app.logo" :alt="tab.title" class="header-icon" />
        <span class="header-title">{{ tab.title }}</span>
      </div>
      <div class="header-actions">
        <button
          class="action-btn"
          @click="handleSplit('horizontal')"
          title="左右分屏"
        >
          ⬌
        </button>
        <button
          class="action-btn"
          @click="handleSplit('vertical')"
          title="上下分屏"
        >
          ⬍
        </button>
        <button
          class="action-btn"
          @click="handleClose"
          title="关闭"
          v-if="canClose"
        >
          ×
        </button>
      </div>
    </div>
    <div class="app-view-content">
      <webview
        ref="webviewRef"
        :data-minapp-id="tab.app.id"
        allowpopups="true"
        partition="persist:webview"
        class="webview"
        :src="tab.app.url"
      ></webview>
    </div>
  </div>
  <div v-else class="app-view empty">
    <div class="empty-content">
      <p>选择一个应用开始使用</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useAppStore } from "../../../store/appStore";
import type { AppSearchConfig } from "../../../store/appStore";

interface Props {
  tabId: string | null;
  paneId: string;
  canClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canClose: false,
});

const appStore = useAppStore();
const webviewRef = ref<HTMLElement | null>(null);

const tab = computed(() => {
  if (!props.tabId) return null;
  return appStore.getTabs.find((t: any) => t.id === props.tabId) || null;
});

const handleSplit = (direction: "horizontal" | "vertical") => {
  appStore.splitPane(direction, props.paneId);
};

const handleClose = (e: MouseEvent) => {
  e.stopPropagation();
  if (props.canClose) {
    appStore.closePane(props.paneId);
  }
};

// 生成搜索注入脚本
const generateSearchScript = (
  searchText: string,
  config: AppSearchConfig
): string => {
  const escapedText = JSON.stringify(searchText);
  const { inputSelector, submitSelector, submitMethod = "enter" } = config;

  return `
    (function() {
      try {
        // 查找输入框（尝试多个选择器）
        const selectors = ${JSON.stringify(
          inputSelector.split(",").map((s) => s.trim())
        )};
        let input = null;
        for (const selector of selectors) {
          input = document.querySelector(selector);
          if (input) break;
        }
        if (!input) {
          console.warn('未找到输入框，尝试的选择器:', selectors);
          return;
        }

        // 设置输入值
        if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
          input.value = ${escapedText};
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (input.isContentEditable || input.contentEditable === 'true') {
          input.textContent = ${escapedText};
          input.innerText = ${escapedText};
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // 提交搜索
        if (${submitMethod === "click" && submitSelector ? "true" : "false"}) {
          setTimeout(() => {
            const submitSelectors = ${
              submitSelector
                ? JSON.stringify(submitSelector.split(",").map((s) => s.trim()))
                : "[]"
            };
            let submitBtn = null;
            for (const selector of submitSelectors) {
              submitBtn = document.querySelector(selector);
              if (submitBtn) break;
            }
            if (submitBtn) {
              submitBtn.click();
            }
          }, 200);
        } else {
          // 使用回车键提交
          setTimeout(() => {
            const enterEvent = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true
            });
            input.dispatchEvent(enterEvent);
            
            const enterEvent2 = new KeyboardEvent('keypress', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true
            });
            input.dispatchEvent(enterEvent2);
            
            const enterEvent3 = new KeyboardEvent('keyup', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true
            });
            input.dispatchEvent(enterEvent3);
          }, 100);
        }
      } catch (error) {
        console.error('搜索脚本执行失败:', error);
      }
    })();
  `;
};

// 执行搜索
const executeSearch = async (
  searchText: string,
  config: AppSearchConfig
): Promise<void> => {
  const webview = webviewRef.value as any;
  if (!webview) {
    console.warn("Webview 未找到");
    return;
  }

  try {
    const script = generateSearchScript(searchText, config);

    // 检查 webview 是否已加载
    if (webview.isLoading && !webview.isLoading()) {
      // 已加载完成，直接执行
      await webview.executeJavaScript(script);
    } else {
      // 等待加载完成
      const executeWhenReady = () => {
        webview.executeJavaScript(script).catch((err: any) => {
          console.error("执行搜索脚本失败:", err);
        });
      };

      if (webview.addEventListener) {
        const handler = () => {
          executeWhenReady();
          webview.removeEventListener("did-finish-load", handler);
        };
        webview.addEventListener("did-finish-load", handler);

        // 如果已经加载完成，立即执行
        setTimeout(() => {
          if (!webview.isLoading || !webview.isLoading()) {
            executeWhenReady();
            webview.removeEventListener("did-finish-load", handler);
          }
        }, 500);
      } else {
        // 如果没有事件监听器，延迟执行
        setTimeout(executeWhenReady, 1000);
      }
    }
  } catch (error) {
    console.error("执行搜索失败:", error);
  }
};

// 监听搜索事件
const handleSearchEvent = (event: CustomEvent) => {
  const { paneId, searchText, config } = event.detail;
  if (paneId === props.paneId && tab.value) {
    executeSearch(searchText, config as AppSearchConfig);
  }
};

onMounted(() => {
  window.addEventListener("search-pane", handleSearchEvent as EventListener);
});

onUnmounted(() => {
  window.removeEventListener("search-pane", handleSearchEvent as EventListener);
});
</script>

<style scoped lang="scss">
.app-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;

  &.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;

    .empty-content {
      color: #999999;
      font-size: 14px;
    }
  }

  .app-view-header {
    height: 32px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 6px;

      .header-icon {
        width: 16px;
        height: 16px;
        border-radius: 2px;
      }

      .header-title {
        font-size: 12px;
        color: #333333;
        font-weight: 500;
      }
    }

    .header-actions {
      display: flex;
      gap: 4px;

      .action-btn {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: #666666;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.2s;

        &:hover {
          background-color: #e3f2fd;
          color: #4a90e2;
        }
      }
    }
  }

  .app-view-content {
    flex: 1;
    overflow: hidden;
    position: relative;

    .webview {
      width: 100%;
      height: 100%;
      background-color: #ffffff;
      display: inline-flex;
      overflow: auto;
    }
  }
}
</style>
