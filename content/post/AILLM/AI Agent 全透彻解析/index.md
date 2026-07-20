---
title: "AI Agent 全透彻解析：Skill、Tool、MCP 与主流 Agent 的关系"
date: 2026-07-20T10:09:24+08:00
categories:
  - AILLM
mermaid: true
draft: false
---

> AI Agent 不是某一种模型，也不只是“能聊天的 AI”。本文以官方定义为准，解释 Agent、Tool、Skill、MCP 的边界，并对比 Claude Code、Codex、OpenCode、OpenClaw、Hermes Agent 与 Nanobot 的定位和关系。

截至 2026 年 7 月，Agent 仍然没有唯一的行业定义。不同厂商强调的角度不同，但核心结构已经相当清楚：

> **模型负责推理，Tool 负责行动，Skill 提供方法，MCP 负责连接；Agent Runtime 把它们组织成能够持续工作的执行循环。**

## 一、权威资料如何定义 Agent？

### 1.1 OpenAI 的定义

[OpenAI Agents SDK 官方文档](https://openai.github.io/openai-agents-python/agents/)将 Agent 定义为：配置了 **Instructions（指令）**、**Tools（工具）**，以及 Handoff、Guardrail、结构化输出等可选运行行为的大语言模型。

这个定义强调 Agent 的**组成**：

```text
Agent = Model + Instructions + Tools + Runtime Behavior
```

### 1.2 Anthropic 的定义

[Anthropic《Building Effective Agents》](https://www.anthropic.com/engineering/building-effective-agents)区分了 Workflow 和 Agent：

- **Workflow**：大模型和工具按照预先定义的代码路径运行。
- **Agent**：大模型动态决定自己的执行过程和工具使用方式。

这个定义强调 Agent 的**决策权**。固定执行“检索→总结→发送”的系统，即使使用了大模型，也更接近 Workflow；能根据工具结果自行决定下一步的系统，才更接近 Agent。

### 1.3 两个定义为什么不冲突？

OpenAI 描述 Agent“由什么组成”，Anthropic 描述 Agent“如何运行”。合在一起，可以得到一个更完整的理解：

> **Agent 是以模型为决策核心，带有指令和工具，并能根据环境反馈持续选择下一步行动的系统。**

{{<mermaid>}}
flowchart LR
    U["用户目标"] --> M["模型判断下一步"]
    M --> Q{"任务完成了吗？"}
    Q -->|否| T["调用 Tool"]
    T --> E["环境返回事实或错误"]
    E --> M
    Q -->|是| R["交付结果"]
    G["权限／Guardrail／人工审批"] -.约束.-> T
{{</mermaid>}}

Agent 的关键不是“回答像人”，而是形成了 **观察→决策→行动→验证** 的闭环。

## 二、模型、Agent 和 Agentic Harness 是什么关系？

这是理解各种产品关系的关键。

### 2.1 模型不是 Agent

Claude、GPT、Gemini 等模型负责理解和生成内容。模型本身通常不直接读取你的磁盘、运行命令或修改代码。

### 2.2 Agentic Harness 把模型变成可行动的 Agent

[Claude Code 官方术语表](https://code.claude.com/docs/en/glossary)把 **Agentic Harness** 定义为：围绕模型提供工具、上下文管理和执行环境，使模型成为 Agent 的运行框架。

[Claude Code 工作原理](https://code.claude.com/docs/en/how-claude-code-works)进一步说明，Claude Code 是 Claude 模型外面的 Harness：模型负责推理，Harness 提供文件访问、Shell、权限、上下文管理和 Agent Loop。

可以类比为：

```text
模型：大脑
Agentic Harness：身体、工作台和管理制度
Agent：两者组合后正在完成任务的系统
```

因此，Claude Code 与 Claude 不是同一个概念，Codex 与底层 GPT 模型也不是同一个概念。

### 2.3 “Agent”这个词为什么经常指不同东西？

日常讨论中，“Agent”至少可能指三层：

| 层次 | 含义 | 例子 |
|---|---|---|
| 产品／Harness | 提供完整 Agent 运行能力的软件 | Claude Code、Codex、OpenCode |
| Agent 配置 | 一组特定模型、指令、工具和权限 | Plan Agent、Review Agent |
| 运行实例 | 正在处理某个任务的一次会话 | 当前修复 Bug 的 Agent Session |

说“Codex 是一个 Agent”时，通常是在说产品层；说“创建一个安全审查 Agent”时，通常是在说配置或运行实例。

## 三、Tool、Skill 和 MCP 的权威定义

### 3.1 Tool：可以执行的具体能力

[OpenAI Agents SDK Tool 文档](https://openai.github.io/openai-agents-python/tools/)将 Tool 描述为让 Agent 获取数据、运行代码、调用外部 API 或操作计算机的能力。

例如：

- `read_file`：读取文件；
- `web_search`：搜索网页；
- `run_tests`：执行测试；
- `send_message`：发送消息；
- `create_order`：创建订单。

Tool 应该具有明确的名称、描述、输入和输出。模型选择 Tool 并生成参数，真正的操作由 Agent Runtime 或外部服务执行。

> **Tool 回答的是：Agent 能做什么？**

### 3.2 Skill：可复用的工作方法

[Agent Skills 官方网站](https://agentskills.io/home)将 Skill 定义为扩展 Agent 专业知识和工作流程的开放格式。一个 Skill 通常是包含 `SKILL.md` 的目录，也可以包含脚本、模板和参考资料。

Skill 采用渐进式加载：

1. Agent 先看到名称和描述。
2. 任务匹配时加载完整 `SKILL.md`。
3. 确有需要时再读取参考资料或执行脚本。

例如，“技术博客写作 Skill”会规定先确定读者、再核验资料、然后组织结构和校对全文。它不会自动赋予 Agent 搜索网络或修改文件的权限。

> **Skill 回答的是：这类任务应该怎么做？**

### 3.3 MCP：连接工具与上下文的标准协议

[Model Context Protocol 官方架构文档](https://modelcontextprotocol.io/docs/learn/architecture)说明，MCP 是 AI 应用交换工具与上下文的协议，不规定应用必须使用什么模型，也不规定 Agent 如何管理上下文。

MCP 采用三类角色：

- **Host**：运行 Agent 的 AI 应用。
- **Client**：Host 中连接某个 Server 的组件。
- **Server**：提供能力或上下文的程序。

MCP Server 可以提供：

| MCP 原语 | 作用 |
|---|---|
| Tools | 可执行的动作 |
| Resources | 可读取的数据和上下文 |
| Prompts | 可复用的提示模板 |

{{<mermaid>}}
flowchart LR
    A["Agent／MCP Host"] --> C["MCP Client"]
    C <-->|"MCP 协议"| S["MCP Server"]
    S --> API["API／数据库／本地程序"]
    S --> T["Tools"]
    S --> R["Resources"]
    S --> P["Prompts"]
{{</mermaid>}}

MCP 不是 Tool 本身。一个 MCP Server 可以暴露多个 Tool；同一个 Agent 也可以同时拥有内置 Tool、普通函数 Tool 和 MCP Tool。

> **MCP 回答的是：Agent 如何以标准方式连接外部能力？**

### 3.4 三者的关系

```text
Skill：规定先查资料、再写作、最后校对
Tool：真正执行搜索、读文件和构建命令
MCP：把外部资料库或内容平台接入 Agent
Agent：根据目标决定何时使用哪一个
```

| 需求 | 应该使用 |
|---|---|
| 增加一个具体动作 | Tool |
| 固化一套重复流程 | Skill |
| 标准化连接外部服务 | MCP |
| 根据现场反馈动态完成任务 | Agent |

## 四、Prompt、Context、RAG、Memory 又是什么？

这些概念负责的是“Agent 知道什么”，而 Tool 负责“Agent 能做什么”。

| 概念 | 作用 | 适用场景 |
|---|---|---|
| Prompt | 描述本次目标 | “分析这个 Bug” |
| Instructions | 长期生效的行为规则 | 代码规范、禁止修改的目录 |
| Context | 模型当前能够看到的信息总和 | 对话、文件、Tool 结果 |
| RAG | 从大型知识库按需取回相关内容 | 企业文档、代码库、历史工单 |
| Memory | 跨会话保存有用信息 | 用户偏好、历史决定、任务状态 |

RAG 不是 Memory。RAG 解决“这次应该查出什么”，Memory 解决“以后还应该记住什么”。Skill 也不是 Memory：Skill 保存的是可复用流程，而不是某次对话的历史。

## 五、六种 Agent 产品分别是什么？

先给出结论：

> **Claude Code、Codex、OpenCode、OpenClaw、Hermes Agent 和 Nanobot 都属于 Agent 产品或 Agent Runtime，但它们服务的主要场景不同。**

前三者以软件开发为中心；后三者更接近长期运行、连接聊天渠道和个人工作流的通用 Agent。

### 5.1 Claude Code

[Anthropic 官方介绍](https://www.anthropic.com/product/claude-code)将 Claude Code 称为 Agentic Coding System。它能够读取代码库、跨文件修改、执行测试并交付代码。

它的定位是：

- **类型**：编码 Agent／Agentic Harness；
- **核心模型**：Claude 系列；
- **主要环境**：终端、IDE、桌面端、Web 和云端执行环境；
- **扩展方式**：`CLAUDE.md`、Skill、MCP、Hook、Subagent 和 Agent Team；
- **主要用途**：理解代码、实现功能、排查 Bug、重构和测试。

Claude Code 是 Agent，不是 Claude 模型本身。Claude 是推理核心，Claude Code 是提供工具、上下文、权限和执行循环的 Harness。

### 5.2 Codex

[OpenAI Codex 官方页面](https://openai.com/codex/)将 Codex 定位为可以端到端完成开发任务的 Coding Agent，覆盖功能开发、重构、迁移和 Pull Request 等工作。

它的定位是：

- **类型**：编码 Agent／Agentic Harness；
- **核心模型**：OpenAI 模型；
- **主要环境**：CLI、IDE、桌面应用和云端任务；
- **扩展方式**：`AGENTS.md`、Skill、MCP、Plugin、Hook 和 Subagent；
- **主要用途**：本地仓库开发、代码审查、并行任务和云端委派。

Codex 也不是一个单独的模型名称。在当前产品语境中，Codex 更应理解为 OpenAI 的 Agent 产品和执行环境。

### 5.3 OpenCode

[OpenCode 官方文档](https://opencode.ai/docs)直接将其定义为开源 AI Coding Agent，可通过终端、桌面应用和 IDE 扩展使用。

它的定位是：

- **类型**：开源编码 Agent／Harness；
- **核心模型**：支持多个模型提供商；
- **主要环境**：终端、桌面端和 IDE；
- **扩展方式**：自定义 Agent、Skill、MCP、Tool、Command 和 Plugin；
- **主要用途**：以厂商中立的方式完成代码开发。

[OpenCode Agent 文档](https://opencode.ai/docs/agents/)区分 Primary Agent 和 Subagent，并允许每个 Agent 使用不同 Prompt、模型和工具权限。这也说明 OpenCode 既是一个 Agent 产品，又是可以承载多个 Agent 配置的 Runtime。

### 5.4 OpenClaw

[OpenClaw 官方仓库](https://github.com/openclaw/openclaw)将其定义为运行在用户自己设备上的 Personal AI Assistant。它通过 Gateway 长期运行，并连接 WhatsApp、Telegram、Slack、Discord、飞书等消息渠道。

它的定位是：

- **类型**：自托管个人 Agent 平台／Gateway；
- **核心模型**：支持多个模型提供商；
- **主要环境**：个人设备、服务进程和消息渠道；
- **扩展方式**：Tool、Skill、Plugin、Channel 和 Agent 配置；
- **主要用途**：让个人 Agent 长期在线，通过常用聊天软件执行真实任务。

OpenClaw 的重点不是代码仓库，而是“常驻、跨渠道、个人化”。它也能执行编码任务，但产品边界比编码 Agent 更广。

### 5.5 Hermes Agent

[Nous Research 官方文档](https://hermes-agent.nousresearch.com/docs/)将 Hermes Agent 定义为具有内置学习循环的 Self-improving AI Agent。它可以从经验创建和改进 Skill，并维护跨会话 Memory。

它的定位是：

- **类型**：通用、自托管、强调自我改进的 Agent Runtime；
- **核心模型**：支持 Nous Portal、OpenRouter、OpenAI 兼容接口等；
- **主要环境**：本机、服务器、容器和多个消息平台；
- **扩展方式**：内置 Tool、Agent Skills、MCP、Memory 和 Subagent；
- **主要用途**：个人助理、研究、自动化、远程任务和长期知识积累。

Hermes Agent 的突出特点是把 Memory、Skill 创建和 Skill 改进组成显式学习闭环，而不只是加载人工编写的 Skill。

### 5.6 Nanobot

[HKUDS Nanobot 官方仓库](https://github.com/HKUDS/nanobot)将 Nanobot 定义为开源、超轻量、可自托管的 Personal AI Agent。它围绕一个小型 Agent Loop 提供聊天渠道、Tool、Memory、MCP、自动化和部署能力。

它的定位是：

- **类型**：轻量级个人 Agent Runtime；
- **核心模型**：支持 OpenAI 兼容接口和本地模型；
- **主要环境**：CLI、WebUI、本地或服务器 Gateway、聊天平台；
- **扩展方式**：Tool、Skill、MCP、Channel、Automation 和 Subagent；
- **主要用途**：以较小、易读、可修改的运行时搭建个人 Agent。

Nanobot 与 OpenClaw、Hermes Agent 的方向相近，但更强调核心轻量、源码可读和低复杂度部署。

## 六、它们之间到底是什么关系？

### 6.1 它们是同一层的产品，不是 Agent 的零件

六个项目都位于“Agent 产品／Harness”这一层。它们内部都可以包含模型、Tool、Skill、Memory、MCP 和一个或多个 Agent 实例。

{{<mermaid>}}
flowchart TB
    subgraph Coding ["编码 Agent／Agentic Harness"]
        CC["Claude Code"]
        CX["Codex"]
        OC["OpenCode"]
    end
    subgraph Personal ["通用／个人 Agent Runtime"]
        CL["OpenClaw"]
        HA["Hermes Agent"]
        NB["Nanobot"]
    end
    M["Model"] --> Coding
    M --> Personal
    T["Tool／Skill／MCP／Memory"] --> Coding
    T --> Personal
    Coding --> ENV1["代码仓库与开发环境"]
    Personal --> ENV2["聊天渠道、个人设备与长期自动化"]
{{</mermaid>}}

它们既不是 Tool，也不是 Skill，更不是 MCP Server。它们是使用这些组件来运行 Agent 的完整产品。

### 6.2 它们是不是互相竞争？

部分竞争，但不是完全同类竞争：

| 产品 | 核心方向 | 最接近的对手 |
|---|---|---|
| Claude Code | Claude 生态的专业编码 Agent | Codex、OpenCode |
| Codex | OpenAI 生态的专业编码 Agent | Claude Code、OpenCode |
| OpenCode | 开源、多模型编码 Agent | Claude Code、Codex |
| OpenClaw | 常驻、多渠道个人 Agent 平台 | Hermes Agent、Nanobot |
| Hermes Agent | 强调 Memory 与自我改进的通用 Agent | OpenClaw、Nanobot |
| Nanobot | 轻量、可读、可自托管的个人 Agent | OpenClaw、Hermes Agent |

编码 Agent 也可以写文档、搜索资料和运行普通命令；个人 Agent 也可以通过 Shell 或 Skill 修改代码。这里的分类表示产品的**主要设计中心**，不是能力的绝对边界。

### 6.3 一个 Agent 能不能调用另一个 Agent？

可以，但需要明确编排关系。例如：

```text
OpenClaw 主 Agent
  └─ 通过命令、Plugin 或自定义 Tool 委派编码任务给 Codex
       └─ Codex 在代码仓库中修改并测试
```

在这个具体系统里，OpenClaw 是 Orchestrator，Codex 被包装为 Tool 或 Worker Agent。但这不是它们天然的产品关系。换一个系统，Codex 也可以调用外部 Agent。

应当区分：

- **产品关系**：Claude Code、Codex 等是独立 Agent 产品。
- **运行关系**：某次任务中，一个 Agent 可以成为另一个 Agent 的 Tool、Subagent 或 Handoff 目标。
- **协议关系**：独立 Agent 跨系统协作可以使用 [A2A](https://a2a-protocol.org/latest/)；Agent 连接 Tool 和 Resource 通常使用 MCP。

## 七、应该如何选择？

| 需求 | 更适合的选择 |
|---|---|
| 深度使用 Claude 完成软件开发 | Claude Code |
| 深度使用 OpenAI 生态并进行本地、桌面和云端编码 | Codex |
| 希望开源、可配置并自由选择模型提供商 | OpenCode |
| 希望个人 Agent 常驻设备并连接大量聊天渠道 | OpenClaw |
| 重视长期 Memory、自动生成 Skill 和自我改进 | Hermes Agent |
| 希望核心轻量、易读、易修改和自托管 | Nanobot |

选择前还应考虑：

1. 数据是留在本机，还是发送到云端模型？
2. Agent 获得了哪些文件、Shell、账号和消息权限？
3. 写入、删除、发送和支付是否需要人工审批？
4. 是否真的需要长期运行、跨渠道和 Memory？
5. 是否能够查看完整 Tool 调用和失败记录？
6. 单 Agent 已经足够时，是否仍然引入了复杂编排？

## 八、最终总结

理解 Agent 生态，可以从三个层次入手：

```text
第一层：模型
Claude、GPT、Gemini 等，负责理解与推理。

第二层：Agent 组件
Prompt、Context、Tool、Skill、MCP、Memory、Guardrail 等。

第三层：Agent 产品／Harness
Claude Code、Codex、OpenCode、OpenClaw、Hermes Agent、Nanobot 等。
```

最后记住这些边界：

- **Agent**：根据环境反馈持续决策和行动的系统。
- **Tool**：一项可以真正执行的能力。
- **Skill**：一套可复用的专业流程和知识。
- **MCP**：连接 Agent 与外部工具、资源的标准协议。
- **Agentic Harness**：把模型、工具、上下文、权限和执行循环组合起来的运行框架。
- **Claude Code／Codex／OpenCode**：以软件开发为中心的 Agent 产品。
- **OpenClaw／Hermes Agent／Nanobot**：以长期运行、个人助理和跨渠道自动化为中心的 Agent Runtime。

新的 Agent 产品还会不断出现，但判断方法不会频繁变化：先看它处于哪一层，再看它把决策权、工具、上下文和权限交给了谁。这样就能分清它是模型、组件、协议，还是一个真正运行 Agent 的完整系统。
