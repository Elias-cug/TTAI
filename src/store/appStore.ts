// appStore 使用 pinia 管理
import { defineStore } from "pinia";

export interface App {
  id: string;
  name: string;
  url: string;
  logo: string;
  bodered?: boolean;
  style?: any;
}

export interface Tab {
  id: string;
  app: App;
  title: string;
}

export interface SplitPane {
  id: string;
  type: "single" | "split";
  direction?: "horizontal" | "vertical";
  children?: SplitPane[];
  tabId?: string; // 如果是 single 类型，关联的 tab id
}

// 应用搜索配置接口
export interface AppSearchConfig {
  inputSelector: string; // 输入框选择器
  submitSelector?: string; // 提交按钮选择器（可选）
  submitMethod?: "click" | "enter"; // 提交方式：点击按钮或按回车
}

export const useAppStore = defineStore("app", {
  state: () => ({
    tabs: [] as Tab[],
    activeTabId: null as string | null,
    splitLayout: {
      id: "root",
      type: "single" as const,
      tabId: null as string | null,
    } as SplitPane,
    // 应用搜索配置映射
    appSearchConfigs: new Map<string, AppSearchConfig>([
      // ChatGPT 配置
      [
        "chatgpt",
        {
          inputSelector: 'textarea, textarea[data-id="root"], #prompt-textarea',
          submitSelector:
            'button[data-testid="send-button"], button[aria-label*="Send"]',
          submitMethod: "click",
        },
      ],
      // Claude 配置
      [
        "claude",
        {
          inputSelector: 'div[contenteditable="true"], textarea',
          submitMethod: "enter",
        },
      ],
      // 通用配置（默认）
      [
        "default",
        {
          inputSelector:
            "textarea, input[type='text'], div[contenteditable='true']",
          submitMethod: "enter",
        },
      ],
    ]),
  }),
  getters: {
    getTabs: (state) => state.tabs,
    getActiveTab: (state) => {
      return state.tabs.find((tab) => tab.id === state.activeTabId);
    },
    getActiveTabId: (state) => state.activeTabId,
    getSplitLayout: (state) => state.splitLayout,
  },
  actions: {
    // Tab 管理
    addTab(app: App) {
      const tabId = `${app.id}-${Date.now()}`;
      const tab: Tab = {
        id: tabId,
        app,
        title: app.name,
      };

      // 如果 tab 已存在，直接激活
      const existingTab = this.tabs.find((t) => t.app.id === app.id);
      if (existingTab) {
        this.activeTabId = existingTab.id;
        return existingTab.id;
      }

      this.tabs.push(tab);
      this.activeTabId = tabId;

      // 确保 tab 显示在面板中
      this.ensureTabInActivePane(tabId);

      return tabId;
    },
    removeTab(tabId: string) {
      const index = this.tabs.findIndex((t) => t.id === tabId);
      if (index === -1) return;

      // 在删除前找到包含该 tab 的面板
      const pane = this.findPaneByTabId(tabId);

      this.tabs.splice(index, 1);

      // 如果删除的是当前激活的 tab，激活下一个或上一个
      if (this.activeTabId === tabId) {
        if (this.tabs.length > 0) {
          const newIndex = Math.min(index, this.tabs.length - 1);
          this.activeTabId = this.tabs[newIndex]?.id || null;
        } else {
          this.activeTabId = null;
        }
      }

      // 从布局中移除该 tab
      this.removeTabFromLayout(tabId);

      // 如果该面板没有其他 tab，自动关闭面板
      // 单个面板（single）只能有一个 tab，删除后肯定为空
      if (pane && pane.type === "single") {
        if (pane.id !== "root") {
          // 如果不是根面板，关闭该面板
          this.closePane(pane.id);
        } else {
          // 如果是根面板，确保它是空的（removeTabFromLayout 已经处理了）
          // 这里不需要额外操作
        }
      }
    },
    removeOtherTabs(tabId: string) {
      const tab = this.tabs.find((t) => t.id === tabId);
      if (!tab) return;

      this.tabs = [tab];
      this.activeTabId = tabId;

      // 重置布局为单个
      this.splitLayout = {
        id: "root",
        type: "single",
        tabId: tabId,
      };
    },
    switchTab(tabId: string) {
      if (this.tabs.find((t) => t.id === tabId)) {
        this.activeTabId = tabId;
        // 确保 tab 显示在面板中（如果已经在某个面板中，不移动）
        this.ensureTabInActivePane(tabId, true);
      }
    },

    // 确保 tab 显示在某个面板中
    ensureTabInActivePane(tabId: string, preferActivePane: boolean = false) {
      // 如果 preferActivePane 为 true，尝试找到当前显示该 tab 的面板
      if (preferActivePane) {
        const currentPane = this.findPaneByTabId(tabId);
        if (currentPane) {
          // tab 已经在某个面板中显示，不需要移动
          return;
        }
      }

      // 查找第一个空的面板，或者使用根面板
      const emptyPane = this.findEmptyPane();
      if (emptyPane) {
        this.setPaneTab(emptyPane.id, tabId);
      } else {
        // 如果没有空面板，使用根面板
        if (this.splitLayout.type === "single") {
          this.splitLayout.tabId = tabId;
        } else {
          // 如果是分屏布局，找到第一个子面板并设置
          const firstPane = this.findFirstSinglePane();
          if (firstPane) {
            this.setPaneTab(firstPane.id, tabId);
          }
        }
      }
    },

    // 查找包含指定 tab 的面板
    findPaneByTabId(tabId: string, pane?: SplitPane): SplitPane | null {
      const target = pane || this.splitLayout;

      if (target.type === "single" && target.tabId === tabId) {
        return target;
      }

      if (target.children) {
        for (const child of target.children) {
          const found = this.findPaneByTabId(tabId, child);
          if (found) return found;
        }
      }

      return null;
    },

    // 查找第一个 single 类型的面板
    findFirstSinglePane(pane?: SplitPane): SplitPane | null {
      const target = pane || this.splitLayout;

      if (target.type === "single") {
        return target;
      }

      if (target.children && target.children.length > 0) {
        return this.findFirstSinglePane(target.children[0]);
      }

      return null;
    },

    // 查找第一个空的面板
    findEmptyPane(pane?: SplitPane): SplitPane | null {
      const target = pane || this.splitLayout;

      if (target.type === "single" && !target.tabId) {
        return target;
      }

      if (target.children) {
        for (const child of target.children) {
          const found = this.findEmptyPane(child);
          if (found) return found;
        }
      }

      return null;
    },
    isTabOpen(appId: string) {
      return this.tabs.some((tab) => tab.app.id === appId);
    },

    // 分屏管理
    splitPane(direction: "horizontal" | "vertical", targetPaneId?: string) {
      const targetPane = this.findPaneById(targetPaneId || this.splitLayout.id);
      if (!targetPane || targetPane.type !== "single") return;

      const currentTabId = targetPane.tabId;
      if (!currentTabId) return;

      // 创建新的分屏结构
      const newPane1: SplitPane = {
        id: `${targetPane.id}-1`,
        type: "single",
        tabId: currentTabId,
      };

      const newPane2: SplitPane = {
        id: `${targetPane.id}-2`,
        type: "single",
        tabId: null,
      };

      targetPane.type = "split";
      targetPane.direction = direction;
      targetPane.tabId = undefined;
      targetPane.children = [newPane1, newPane2];
    },

    closePane(paneId: string) {
      // 找到要关闭的面板
      const paneToClose = this.findPaneById(paneId);
      if (!paneToClose) return;

      // 收集该面板及其所有子面板中的 tabId（在关闭面板前收集，此时布局还未改变）
      const tabIdsToRemove = this.collectTabIdsFromPane(paneToClose);

      // 先关闭面板布局（在删除 tab 之前，这样布局结构还是完整的）
      if (paneId === this.splitLayout.id) {
        // 如果是根节点，重置为单个空面板
        this.splitLayout = {
          id: "root",
          type: "single",
          tabId: null,
        };
      } else {
        const parent = this.findParentPane(paneId);
        if (parent && parent.children) {
          // 找到要关闭的面板和兄弟面板
          const index = parent.children.findIndex((p) => p.id === paneId);
          if (index !== -1) {
            const siblingIndex = index === 0 ? 1 : 0;
            const sibling = parent.children[siblingIndex];

            if (sibling) {
              // 如果父级是根节点
              if (parent.id === this.splitLayout.id) {
                // 直接用兄弟面板替换根节点
                this.splitLayout = { ...sibling };
              } else {
                // 如果兄弟面板是 single，提升它到父级
                if (sibling.type === "single") {
                  parent.type = "single";
                  parent.tabId = sibling.tabId;
                  parent.direction = undefined;
                  parent.children = undefined;
                } else {
                  // 如果兄弟面板是 split，用兄弟面板替换父级
                  parent.type = sibling.type;
                  parent.direction = sibling.direction;
                  parent.tabId = sibling.tabId;
                  parent.children = sibling.children;
                }
              }
            }
          }
        }
      }

      // 关闭面板后，删除所有相关的 tab
      // 从后往前删除，避免索引问题
      if (tabIdsToRemove.length > 0) {
        // 先找到所有要删除的 tab 的索引
        const tabIndices = tabIdsToRemove
          .map((tabId) => this.tabs.findIndex((t) => t.id === tabId))
          .filter((index) => index !== -1)
          .sort((a, b) => b - a); // 从大到小排序，从后往前删除

        // 记录当前激活的 tab 是否会被删除
        const activeTabWillBeRemoved = tabIdsToRemove.includes(
          this.activeTabId
        );

        // 从后往前删除 tab
        for (const tabIndex of tabIndices) {
          const tabId = this.tabs[tabIndex].id;
          this.tabs.splice(tabIndex, 1);
        }

        // 如果删除的是当前激活的 tab，激活下一个或上一个
        if (activeTabWillBeRemoved) {
          if (this.tabs.length > 0) {
            // 激活第一个可用的 tab
            this.activeTabId = this.tabs[0]?.id || null;
          } else {
            this.activeTabId = null;
          }
        }
      }
    },

    // 收集面板及其所有子面板中的 tabId
    collectTabIdsFromPane(pane: SplitPane): string[] {
      const tabIds: string[] = [];

      const collectRecursive = (p: SplitPane) => {
        if (p.type === "single" && p.tabId) {
          tabIds.push(p.tabId);
        } else if (p.type === "split" && p.children) {
          // 递归收集所有子面板的 tabId
          for (const child of p.children) {
            collectRecursive(child);
          }
        }
      };

      collectRecursive(pane);
      return tabIds;
    },

    setPaneTab(paneId: string, tabId: string) {
      const pane = this.findPaneById(paneId);
      if (pane && pane.type === "single") {
        pane.tabId = tabId;
      }
    },

    // 辅助方法
    findPaneById(paneId: string, pane?: SplitPane): SplitPane | null {
      const target = pane || this.splitLayout;
      if (target.id === paneId) return target;

      if (target.children) {
        for (const child of target.children) {
          const found = this.findPaneById(paneId, child);
          if (found) return found;
        }
      }

      return null;
    },

    findParentPane(
      paneId: string,
      pane?: SplitPane,
      parent?: SplitPane
    ): SplitPane | null {
      const target = pane || this.splitLayout;

      if (target.id === paneId) return parent || null;

      if (target.children) {
        for (const child of target.children) {
          const found = this.findParentPane(paneId, child, target);
          if (found !== null) return found;
        }
      }

      return null;
    },

    removeTabFromLayout(tabId: string) {
      const removeFromPane = (pane: SplitPane) => {
        if (pane.type === "single" && pane.tabId === tabId) {
          pane.tabId = null;
        } else if (pane.children) {
          pane.children.forEach(removeFromPane);
        }
      };

      removeFromPane(this.splitLayout);
    },

    // 获取应用的搜索配置
    getAppSearchConfig(appId: string): AppSearchConfig {
      return (
        this.appSearchConfigs.get(appId.toLowerCase()) ||
        this.appSearchConfigs.get("default")!
      );
    },

    // 收集所有包含 tab 的面板
    getAllPanesWithTabs(pane?: SplitPane): SplitPane[] {
      const result: SplitPane[] = [];
      const target = pane || this.splitLayout;

      if (target.type === "single" && target.tabId) {
        result.push(target);
      }

      if (target.children) {
        for (const child of target.children) {
          result.push(...this.getAllPanesWithTabs(child));
        }
      }

      return result;
    },

    // 搜索所有应用
    async searchAllApps(searchText: string): Promise<void> {
      const panesWithTabs = this.getAllPanesWithTabs();

      if (panesWithTabs.length === 0) {
        console.warn("没有打开的应用");
        return;
      }

      // 为每个面板发送搜索请求
      const searchPromises = panesWithTabs.map((pane) => {
        const tab = this.tabs.find((t) => t.id === pane.tabId);
        if (!tab) return Promise.resolve();

        const config = this.getAppSearchConfig(tab.app.id);
        return this.sendSearchToPane(pane.id, searchText, config);
      });

      await Promise.allSettled(searchPromises);
    },

    // 向指定面板发送搜索（这个方法会被 AppView 调用）
    async sendSearchToPane(
      paneId: string,
      searchText: string,
      config: AppSearchConfig
    ): Promise<void> {
      // 这个方法会通过事件或直接调用 AppView 的方法来实现
      // 由于需要在组件中访问 webview，我们通过事件来触发
      window.dispatchEvent(
        new CustomEvent("search-pane", {
          detail: { paneId, searchText, config },
        })
      );
    },
  },
});
