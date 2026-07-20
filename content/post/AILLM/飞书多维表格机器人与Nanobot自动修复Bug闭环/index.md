---
title: "把 Bug 修复接入飞书：多维表格、机器人与 Nanobot 的人机协同闭环"
date: 2026-07-20T06:40:00+08:00
categories:
  - AILLM
mermaid: true
draft: false
---

> 本文介绍一套运行在 Mac mini 上的 Bug 修复闭环：飞书多维表格负责记录和派单，Nanobot 负责分析、修复和推送分支，开发者负责最终 Review 与合并。

这不是一条“全 AI 工作流”，而是一套 **Human-in-the-loop（人工参与）** 的混合工作流。固定规则交给自动化，高变化任务交给 Agent，高风险决策仍然由人完成。

## 一、先把每一步交给合适的执行者

团队在飞书群中反馈的 Bug，通常只是一句对现象的描述：

> 商店页兑换商品后没有扣除钻石。

从这句话到修复代码，需要经过建单、派单、分析、修改和审核。它们并不都适合交给 Agent：

| 阶段 | 执行者 | 具体动作 |
|------|--------|----------|
| 反馈问题 | 人 | 描述肉眼可见的异常，按需提供截图或录屏 |
| 创建工单 | 多维表格机器人 | 被 `@` 后自动把群聊反馈写入多维表格 |
| 分发工单 | 多维表格自动化 | 新增记录后向机器人群发送卡片并 `@AIZZW` |
| 分析与修复 | Nanobot Agent | 读取材料、定位根因、修改代码、测试并推送分支 |
| 审核与关闭 | 人 | Review 修复分支、合并 `main` 并更新工单状态 |

这里最重要的不是“用了多少 AI”，而是每一步的职责是否清楚。创建记录和发送消息都有确定的触发条件，不需要大模型参与；代码修复会随 Bug、仓库和上下文变化，才需要 Agent 动态决策；合并 `main` 影响范围大，因此保留人工门禁。

## 二、不要把整条流程都 AI 化

[Anthropic 对 Agentic System 的划分](https://www.anthropic.com/engineering/building-effective-agents)提供了一个实用的判断框架：

- **Workflow（工作流）**：执行步骤由人提前编排好，大模型只能按照既定流程完成任务。
- **Agent（智能体）**：人只给出目标，大模型根据当前结果自行决定下一步做什么、调用什么工具。
- **Deterministic Automation（确定性自动化）**：不需要大模型判断，条件满足后就执行固定动作。例如，表格新增记录后发送 Webhook，收到消息后转发到指定群聊。

端到端 AI 自动化看起来很理想，实际却会快速引入身份认证、上下文传递、状态管理、失败恢复、幂等性、可观测性和安全审计等问题。流程越长，模型的不确定性与外部系统的失败概率越容易叠加。

因此，没有必要一开始就把整个工作流 AI 化。更稳妥的方式是找到流程中真正需要理解和推理的局部瓶颈：

> **把一张自然语言 Bug 工单，转化为经过验证的代码修复分支。**

工单创建与任务分发继续使用飞书已有的确定性自动化，只有代码分析和修复交给 Agent。这种方式可以称为 **Bounded Autonomy（有边界的自主性）**：Agent 能够在限定仓库和 worktree 中自主执行，但不能直接合并 `main`。

NIST AI 风险管理框架同样强调，应明确人机协作中的职责，并根据应用场景设计[人工监督机制](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)。AI 化的目标不是移除所有人，而是把人放在最需要判断和承担责任的位置。

## 三、为什么选择 Nanobot

既然目标只是先打通一个局部 AI 环节，就没有必要从复杂的多 Agent 编排平台开始。

我选择 [Nanobot](https://github.com/HKUDS/nanobot)，主要基于三点：

1. **足够轻量**：可以直接运行在 Mac mini 上，不需要额外搭建一套复杂的调度和状态服务。
2. **原生接入飞书**：支持飞书长连接，不要求 Mac mini 暴露公网 HTTP 地址。
3. **支持 Skill 扩展**：可以把“读取飞书卡片”和“修复代码仓库”拆成独立能力，并明确各自边界。

轻量并不意味着功能越少越好，而是让系统复杂度与当前目标匹配。先让一个 Agent 稳定完成“工单到修复分支”，验证价值后再决定是否扩展其他环节。

整套闭环如下：

{{<mermaid>}}
flowchart LR
    U["人<br/>反馈可见问题"] --> G["飞书群<br/>提交反馈"]
    G --> B["自动化机器人<br/>创建工单"]
    B --> D["多维表格自动化<br/>派发卡片"]
    D --> N["Nanobot Agent<br/>分析与修复"]
    N --> W["Git Worktree<br/>测试并推送分支"]
    W --> H["人<br/>Review 与验证"]
    H --> M["main 分支<br/>人工合并"]
    H --> B
{{</mermaid>}}

多维表格是工单的事实来源，飞书话题保存处理过程，Git 修复分支是 Agent 的技术交付物。

## 四、最小化部署

### 4.1 在 Mac mini 上运行 Nanobot

Nanobot 需要 Python 3.11 或更高版本。按照[官方快速开始](https://github.com/HKUDS/nanobot/blob/main/docs/quick-start.md)完成安装和模型配置：

```bash
curl -fsSL https://raw.githubusercontent.com/HKUDS/nanobot/main/scripts/install.sh | sh

nanobot onboard --wizard
nanobot status
nanobot agent -m "Hello!"
```

命令行对话正常后，再启动连接飞书的 Gateway：

```bash
nanobot gateway
```

验证稳定后，可以参考官方的 [macOS 部署说明](https://github.com/HKUDS/nanobot/blob/main/docs/deployment.md)，通过后台 Gateway 或 LaunchAgent 让它随 Mac mini 登录启动。

### 4.2 接入飞书

在飞书开放平台创建自建应用并启用机器人能力，然后完成以下配置：

- 开通消息收发权限和 `im.message.receive_v1` 事件。
- 事件订阅使用长连接模式。
- Nanobot 的 `groupPolicy` 使用 `mention`，只在被 `@` 时响应。
- 使用 `allowFrom` 限制可以触发 Agent 的成员。

`feishu-card-thread` 还需要飞书官方 [lark-cli](https://github.com/larksuite/cli) 读取卡片、下载附件和回复原话题：

```bash
npx @larksuite/cli@latest install
lark-cli config init
lark-cli auth login --recommend
lark-cli auth status
```

### 4.3 安装修复 Skill

本流程使用的 Skill 位于 [CrownJoker07/AgentSkills](https://github.com/CrownJoker07/AgentSkills)：

```bash
git clone https://github.com/CrownJoker07/AgentSkills.git
cd AgentSkills
./install.sh
```

其中两个 Skill 各司其职：

| Skill | 职责 |
|-------|------|
| `feishu-card-thread` | 读取卡片和附件，在原卡片话题中提问、报告进度与交付结果 |
| `repo-bugfix` | 诊断 Bug，在独立 worktree 中修复、Review、测试、提交并推送分支 |

飞书 Skill 不修改代码，修复 Skill 也不直接操作飞书。通道和业务分离后，权限与故障边界都会更清楚。

## 五、一张工单如何变成修复分支

多维表格机器人创建工单时，卡片至少需要包含 Bug 标题、当前表现、预期表现、复现步骤、目标仓库在 Mac mini 上的绝对路径，以及已有截图或录屏。没有提供的日志和报错不能由 Agent 猜测。

{{<mermaid>}}
sequenceDiagram
    participant U as 反馈人
    participant B as 飞书自动化
    participant N as Nanobot
    participant F as 飞书卡片 Skill
    participant R as 仓库修复 Skill
    participant G as Git 仓库
    participant H as 开发者

    U->>B: 反馈 Bug，自动创建并派发工单
    B->>N: 发送卡片并提醒 AIZZW
    N->>F: 读取卡片、上下文和附件
    F->>R: 传递脱敏后的任务材料
    R->>R: 定位根因并判断是否可修复
    alt 材料不足或无法修复
        R-->>F: 返回最小补充问题或阻断原因
        F-->>U: 在原话题回复
    else 可以修复
        R->>R: 创建 worktree，修改、Review 和测试
        R->>G: 提交并推送修复分支
        R-->>F: 返回根因、变更和测试结果
        F-->>H: 在原话题交付修复报告
        H->>G: 人工验证并合并 main
        H->>B: 人工更新工单状态
    end
{{</mermaid>}}

`repo-bugfix` 不会收到卡片后立即修改代码。它先确认问题是否成立、根因是否位于指定仓库、现有证据是否足以支持修改。证据不足时只追问阻断当前步骤的最小信息。

确认可以修复后，Skill 创建独立 worktree 和 `fix/<bug-name>` 分支。所有修改、Review 和测试都在 worktree 内完成，只有验证通过才提交并推送。它不会自动创建 PR、强制推送或合并 `main`。

## 六、简单也是一种扩展能力

当前方案可以看作一个 **Minimum Viable Workflow（最小可行工作流）**：先用最少的组件跑通闭环，再根据真实瓶颈增加能力。因为各环节职责独立，后续优化不需要推翻整条链路，只需在合适的位置插入新的 Agent 或自动化节点。

例如，反馈人可能只写一句“商店页兑换商品后没有扣除钻石”。这足以说明可见现象，却没有商品类型、复现条件和相关功能规则。此时可以在“自动建单”和“代码修复”之间增加一个 **Bug Triage Agent（缺陷分诊 Agent）**，专门负责 **Context Enrichment（上下文增强）**：

```text
原始反馈 → 自动创建工单 → 缺陷分诊 Agent → 仓库修复 Agent
```

缺陷分诊 Agent 需要建立在对项目的真实理解之上，例如读取项目文档、模块说明、相关代码和历史工单。它的输出不是凭空补全一个看似完整的故事，而是明确区分：

- 已经确认的事实；
- 根据项目知识得到的候选模块和排查方向；
- 仍然缺失的信息，以及需要向反馈人提出的最小问题。

经过分诊后，粗略描述会变成结构更清楚、证据边界更明确的工单，再交给 `repo-bugfix`。如果原始材料已经足够，则可以直接进入修复流程，不必强制增加一次模型调用。

这体现了 **Composable Architecture（可组合架构）** 和 **Progressive Enhancement（渐进式增强）** 的思路：保持主干简单，只在实际瓶颈处增加智能，而不是预先搭建一套庞大却尚未被验证的多 Agent 系统。

## 七、把人工留在高风险节点

Agent 推送分支不等于 Bug 已经完成。模型可能误解业务规则，测试也不一定覆盖真实场景，因此开发者仍需完成：

1. 核对根因与工单描述是否一致。
2. 查看完整 Diff，排除无关修改和敏感信息。
3. 重新执行相关测试并验证原始问题。
4. 合并 `main`，再把工单更新为“已完成”。

同时遵循最小权限原则：飞书机器人只读取必要的消息和附件，Git 凭据只授权目标仓库，Nanobot 只操作工单明确指定的目录，凭据和内部日志不得出现在卡片或提交记录中。

## 八、总结

这套方案不是用 AI 替换所有工具，而是把不同任务交给最合适的执行者：

```text
人反馈问题 → 自动化建单和派单 → Agent 分析并推送修复分支
           → 人工 Review 和合并 → 关闭工单
```

完整的 AI 自动化工作流很难一次搭好，也未必有必要。先选择一个边界明确、结果可验证的局部流程进行 AI 化，再用确定性自动化和人工门禁包住它，通常更容易落地，也更容易保持可控。

当粗略反馈、测试覆盖或任务分流成为新的瓶颈时，再加入对应的 Agent。这种从最小闭环逐步演进的方式，比一开始追求“全流程 AI 化”更务实。
