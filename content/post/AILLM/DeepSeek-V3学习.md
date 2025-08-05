---
title: DeepSeek-V3学习
slug: AILLM-1
date: 2025-04-19 14:37:00+0800
categories:
    - AILLM
---

> 最近AI大模型非常流行、中国也产生了许多属于自己的AI大模型，例如DeepSeek-V3等，作为程序员，我也打算了解一下AI大模型究竟是什么原理，居然可以通过对话的形式告诉你答案。

### 源码拉取
源码地址：<https://github.com/deepseek-ai/DeepSeek-V3.git>  
我fork了一份，方便自己学习。搞不好，还能提交PR，成为贡献者之一。

### 官方论文
地址：<https://arxiv.org/pdf/2412.19437>

### 项目布局分析
```
# 项目目录结构
.
├── README.md                 # 核心说明文档
│   ├── 模型架构说明（MLA注意力/负载均衡策略）
│   ├── 多框架支持（SGLang/LMDeploy/vLLM等）
│   ├── 性能基准（代码/数学/中英文任务）
│   └── 商用许可（MIT License）
│
└── inference/                # 推理核心模块
    ├── convert.py            # 权重格式转换工具
    │   ├── 参数: --n-experts 256 --model-parallel 16
    │   └── 关键技术：MoE分片/参数名映射
    │
    ├── fp8_cast_bf16.py      # 精度转换工具
    │   ├── 功能: FP8→BF16转换
    │   └── 特性: 动态缩放因子管理/内存优化
    │
    ├── generate.py           # 分布式推理入口
    │   ├── 交互式聊天接口（>>> 提示符）
    │   ├── 批量处理（--input-file参数）
    │   └── 多节点通信（torchrun启动）
    │
    ├── kernel.py             # 高性能计算核
    │   ├── FP8矩阵乘法（Triton实现）
    │   ├── 权重反量化核（block_size=128）
    │   └── 激活量化函数
    │
    ├── model.py              # 模型架构定义
    │   ├── Transformer主类（片段25）
    │   ├── MLA注意力（分离式位置编码）
    │   └── MoE门控（专家分组选择）
    │
    └── configs/              # 模型配置目录
        ├── config_16B.json   # 轻量级配置（RTX 4090等）
        ├── config_236B.json  # 中规模配置（企业级单机）
        └── config_671B.json  # 全量配置（多节点分布式）
```

### README阅读
#### Introduction
> We present DeepSeek-V3, a strong Mixture-of-Experts (MoE) language model with 671B total parameters with 37B activated for each token. To achieve efficient inference and cost-effective training, DeepSeek-V3 adopts Multi-head Latent Attention (MLA) and DeepSeekMoE architectures, which were thoroughly validated in DeepSeek-V2. Furthermore, DeepSeek-V3 pioneers an auxiliary-loss-free strategy for load balancing and sets a multi-token prediction training objective for stronger performance. We pre-train DeepSeek-V3 on 14.8 trillion diverse and high-quality tokens, followed by Supervised Fine-Tuning and Reinforcement Learning stages to fully harness its capabilities. Comprehensive evaluations reveal that DeepSeek-V3 outperforms other open-source models and achieves performance comparable to leading closed-source models. Despite its excellent performance, DeepSeek-V3 requires only 2.788M H800 GPU hours for its full training. In addition, its training process is remarkably stable. Throughout the entire training process, we did not experience any irrecoverable loss spikes or perform any rollbacks.

关键点：Mixture-of-Experts (MoE)、Multi-head Latent Attention (MLA) 、auxiliary-loss-free strategy、multi-token prediction

评测基准：
- MMLU（Massive Multitask Language Understanding，大规模多任务语言理解）：  
一个涵盖 57 个主题的多项选择题基准，用于评估大规模语言模型的知识和推理能力。包括基本数学、美国历史、计算机科学、法律等多个领域。
- MMLU Pro：  
MMLU 的专业级别版本，包含更具挑战性的问题，旨在评估模型在专业领域的理解和推理能力。
- GPQA-Diamond（Grade-Level Problems in Question Answering）：  
旨在提供一个全面的框架，能够测试模型在多种推理场景下的能力，并推动大模型在更加复杂任务上的改进。
- MATH-500：  
OpenAI从MATH评测数据集中精选的500个更具代表性的数学评测基准
- AIME 2024（American Invitational Mathematics Examination）：  
美国数学邀请赛，是美国面向中学生的邀请式竞赛，3个小时完成15道题，难度很高。
- SWE-bench（Software Engineering Bench）：  
一个从GitHub上提炼的真实世界的Python代码仓的任务评测数据集
- SWE-bench Verified：  
OpenAI基于SWE-Bench提炼的更加准确和更具代表性的大模型代码工程任务解决能力评测

#### Model Summary
---
Architecture: Innovative Load Balancing Strategy and Training Objective

On top of the efficient architecture of DeepSeek-V2, we pioneer an auxiliary-loss-free strategy for load balancing, which minimizes the performance degradation that arises from encouraging load balancing.
We investigate a Multi-Token Prediction (MTP) objective and prove it beneficial to model performance. It can also be used for speculative decoding for inference acceleration.