import BaicuanAppLogo from "@/assets/apps/baixiaoying.webp?url";
import DoubaoAppLogo from "@/assets/apps/doubao.png?url";
import GeminiAppLogo from "@/assets/apps/gemini.png?url";
import GrokAppLogo from "@/assets/apps/grok.png?url";
import KimiAppLogo from "@/assets/apps/kimi.webp?url";
import StepfunAppLogo from "@/assets/apps/stepfun.png?url";
import TencentYuanbaoAppLogo from "@/assets/apps/yuanbao.webp?url";
import HailuoModelLogo from "@/assets/models/hailuo.png?url";
import QwenModelLogo from "@/assets/models/qwen.png?url";
import DeepSeekProviderLogo from "@/assets/providers/deepseek.png?url";
import OpenAiProviderLogo from "@/assets/providers/openai.png?url";
import SiliconFlowProviderLogo from "@/assets/providers/silicon.png?url";
import ZhipuProviderLogo from "@/assets/providers/zhipu.png?url";

export const AIAppList = [
  {
    id: "deepseek",
    name: "DeepSeek",
    url: "https://chat.deepseek.com/",
    logo: DeepSeekProviderLogo,
  },
  {
    id: "tencent-yuanbao",
    name: "Tencent Yuanbao",
    logo: TencentYuanbaoAppLogo,
    url: "https://yuanbao.tencent.com/chat",
    bodered: true,
  },

  {
    id: "moonshot",
    name: "Kimi",
    url: "https://kimi.moonshot.cn/",
    logo: KimiAppLogo,
  },
  {
    id: "doubao",
    name: "Doubao",
    url: "https://www.doubao.com/chat/",
    logo: DoubaoAppLogo,
  },
  {
    id: "dashscope",
    name: "Tongyi",
    url: "https://www.tongyi.com/",
    logo: QwenModelLogo,
  },
  {
    id: "minimax",
    name: "Minimax",
    url: "https://chat.minimaxi.com/",
    logo: HailuoModelLogo,
    bodered: true,
  },

  {
    id: "zhipu",
    name: "Zhipu",
    url: "https://chatglm.cn/main/alltoolsdetail",
    logo: ZhipuProviderLogo,
    bodered: true,
  },
  {
    id: "baichuan",
    name: "Baichuan",
    url: "https://ying.baichuan-ai.com/chat",
    logo: BaicuanAppLogo,
  },
  {
    id: "stepfun",
    name: "Stepfun",
    url: "https://stepfun.com",
    logo: StepfunAppLogo,
    bodered: true,
  },
  {
    id: "openai",
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    logo: OpenAiProviderLogo,
    bodered: true,
  },
  {
    id: "gemini",
    name: "Gemini",
    url: "https://gemini.google.com/",
    logo: GeminiAppLogo,
  },
  {
    id: "grok",
    name: "Grok",
    logo: GrokAppLogo,
    url: "https://grok.com",
    bodered: true,
  },
 
];
