---
title: git如何删除历史大文件
slug: Git-1
date: 2025-03-02 00:00:00+0000
categories:
    - Git
---

> 刚刚写第一篇“终于拥有自己的博客啦！！！”的时候，不小心上传了个 10M 左右的 gif 图，即使我已经删掉了，.git文件夹里面还是保留（意味着历史记录也保留了），问题来了应该如何删除历史大文件呢？

**概要：**  
找到大文件，删除即可，发现其实本质上就是克隆了个新项目，删除了指定文件，需要强制推送到远程仓库。所以是有可能导致原仓库数据丢失，因此尽量少传大文件，不到必不可以不要使用以下命令！！！

## 第一步：找到大文件

```Shell
git rev-list --objects --all | 
git cat-file --batch-check='%(objectname) %(objecttype) %(objectsize) %(rest)' | 
sort -k3 -n | 
tail -5
```
以下是该命令的详细解析，分步骤解释其作用及实现原理：

**1. `git rev-list --objects --all`**
- **功能**：列出 Git 仓库中所有对象（包括提交、树、blob 等）的哈希值和路径。
  - `--objects`：输出所有对象的哈希值及关联路径（如文件路径）。
  - `--all`：覆盖所有引用（分支、标签等），确保包含整个仓库历史。
- **输出示例**：
  ```
  c7a9d8... blob    path/to/file.txt
  8a4d2... commit  HEAD
  ```

---

**2. `git cat-file --batch-check='%(objectname) %(objecttype) %(objectsize) %(rest)'`**
- **功能**：批量检查对象信息，提取哈希、类型、大小和路径。
  - `--batch-check`：以批处理模式解析输入行，按格式输出信息。
  - **格式说明**：
    - `%(objectname)`：对象哈希值。
    - `%(objecttype)`：对象类型（`blob`、`tree`、`commit`）。
    - `%(objectsize)`：对象占用存储空间（字节）。
    - `%(rest)`：对象关联路径（仅对 `blob` 类型有效，其他类型为空）。
- **输出示例**：
  ```
  c7a9d8... blob    120000   path/to/large-file.jpg
  8a4d2... tree    4096     (空)
  ```

---

**3. `sort -k3 -n`**
- **功能**：按第三列（对象大小）进行数字排序。
  - `-k3`：指定以第三列为排序键。
  - `-n`：按数值大小排序（默认按字符串排序会导致 `100` < `20`）。
- **结果示例**（排序后）：
  ```
  ...  
  d3f4a... blob    500      path/to/small.txt
  c7a9d... blob    120000   path/to/large.jpg
  ```

---

**4. `tail -5`**
- **功能**：取排序结果的最后 5 行，即最大的 5 个对象。
  - 因 `sort` 是升序排列，末尾行对应最大文件。
- **最终输出示例**：
  ```
  c7a9d... blob    120000   path/to/large.jpg
  9b2e4... blob    95000    path/to/video.mp4
  ```

---

**适用场景**
- **定位大文件**：快速找出仓库中占用空间最大的文件（如误提交的二进制文件）。
- **性能优化**：清理历史大文件前进行验证，避免误删关键数据。
- **兼容性**：当 `.git/objects/pack` 下无 `.idx` 文件时（如新仓库），此命令仍可运行。

---

**注意事项**
1. **路径显示限制**：
   - 仅 `blob` 类型对象会显示路径，`tree` 和 `commit` 类型的 `%(rest)` 列为空。
   - 需结合 `git log` 或 `git rev-list` 追溯具体提交记录。
2. **对象类型区分**：
   - `blob` 为文件内容，`tree` 为目录结构，`commit` 为提交信息。
   - 大文件通常为 `blob` 类型。
3. **性能影响**：
   - 对大型仓库（如数万提交），`git rev-list` 可能耗时较长，建议在空闲时执行。

---

## 第二步：删除大文件
> 研究发现有两条命令：Git filter-branch 和 git filter-repo
**Git filter-branch 与 git filter-repo 使用对比与选择指南**
---

**一、git filter-repo 核心用法(需要安装 Python、filter-repo)**

**1. 删除文件/目录**
```bash
git filter-repo --force --path "giphy-1.gif" --invert-paths #删除指定文件
git filter-repo --path-glob '*.log' --invert-paths  # 删除所有.log文件
git filter-repo --path target/ --invert-paths       # 删除target目录
```
- **优势**：直接操作对象数据库，无需检出文件，速度提升数十倍 。  
- **附加功能**：自动清理空提交，无需 `--prune-empty` 参数。

---

**二、git filter-branch 的局限性与适用场景**

**局限性**
- **性能差**：处理万级提交时耗时可能超过 `filter-repo` 的 100 倍 。  
- **操作复杂**：需手动处理引用残留（如 `.git/refs/original`）和强制推送 。  
- **兼容性问题**：可能破坏 `git replace` 或 `grafts` 机制 。

**仅推荐在以下场景使用**
1. **无 Python 环境**：`filter-repo` 依赖 Python，若环境受限可临时用 `filter-branch`。  
2. **简单单次操作**：例如删除单个文件的少量历史记录，命令示例：  
   ```bash
   git filter-branch --index-filter 'git rm --cached --ignore-unmatch secret.txt' --prune-empty --tag-name-filter cat -- --all
   ```

---

**三、核心区别总结**
| **维度**          | **git filter-branch**               | **git filter-repo**               |
|--------------------|--------------------------------------|------------------------------------|
| **性能**           | 极低（逐提交处理）        | 高（批量处理对象数据库） |
| **安全性**         | 高风险（残留引用、破坏分支）   | 自动清理无效引用，结构稳定   |
| **操作复杂度**     | 需手动处理参数和清理步骤       | 命令简洁，参数语义明确       |
| **功能扩展性**     | 有限（依赖 Shell 脚本）        | 支持 Python 回调，灵活定制  |
| **官方推荐度**     | 已弃用，仅保留兼容性      | 官方推荐替代工具        |

---

**四、操作注意事项**
1. **备份仓库**：操作前务必通过 `git clone --mirror` 备份。  
2. **协作同步**：强制推送后需通知协作者重新克隆仓库。  
3. **验证结果**：  
   - 检查文件是否彻底删除：`git log -- <file-name>`  
   - 对比仓库体积：`du -sh .git`。  
4. **清理远程仓库**：GitHub/GitLab 需手动触发存储库清理或重新推送。

---

**附：命令替换对照表**
| **filter-branch 场景**       | **filter-repo 等效命令**              |
|------------------------------|---------------------------------------|
| 删除文件                     | `--path <file> --invert-paths`        |
| 保留子目录                   | `--subdirectory-filter <dir>`        |
| 修改提交邮箱                 | `--email-callback` + Python 函数      |
| 清理空提交                   | 自动处理，无需参数                    |

通过以上对比，**`git filter-repo` 在效率、安全性和易用性上全面胜出**，建议优先使用。仅在对环境或兼容性有特殊需求时考虑 `filter-branch`。

## 第三步：强制推送到远程仓库
```base
git push --force origin main
```