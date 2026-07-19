---
title: "数据结构"
date: "2025-02-16T15:16:25+08:00"
draft: false
license: false
---

# 一、基本概念
## 1. 数据结构分类
### 逻辑结构：
1. 线性结构
2. 集合
3. 树形结构
4. 图结构
### 物理结构：
1. 顺序存储：把逻辑上相邻的元素存储在物理位置也相邻的存储单元中。
	优点：支持随机存取、存储密度高
	缺点：大片连续空间分配不方便，改变容量不方便

2. 链式存储
	优点：离散的小空间分配方便，改变容量方便
	缺点：不可随机存取，存储密度低

|        |   增   |   删    | 按位查找 | 按值查找 |
| :----: | :----: | :----: | :----: | :----: |
|  顺序  |   O(n) |   O(n)  |  O(1)  |  O(n)  |
|  链式  |   O(n) |   O(n)  |  O(n)  |  O(n)  |

3. 索引存储
4. 散列存储

## 2. 算法效率
时间复杂度、空间复杂度

---
# 二、数据结构
## 1. 线性表
具有相同数据类型的n（n>=0）个数据元素的有限序列

### 1. 顺序表
特点：
	1. 随机访问：能在O(1)时间内找到第i个元素
	2. 存储密度高
	3. 拓展容量不方便
	4. 插入、删除数据元素不方便
基本操作：
1. 插入：插入位置之后的元素都要往后移，时间复杂度：O(1)、O(n)、O(n)；
```CPP
// 基本操作-插入数据
bool ListInsert(Seqlist& L, int i, int e)
{
    // 检测输入是否有效
    if (i <= 0 || i > L.length + 1)
    {
        return false;
    }

    // 检测是否有位置插入
    if (L.MaxSize <= L.length)
    {
        IncreaseSize(L, L.MaxSize * 2); // 扩充两倍
    }

    // 将i位后的所有数字往后移一位
    for (int j = L.length; j >= i; j--)
    {
        L.data[j] = L.data[j - 1];
    }

    L.data[i - 1] = e; // 插入数据
    L.length++; // 更新数组长度

    return true;
}
```
2. 删除：删除位置之后的元素都要往前移，时间复杂度：O(1)、O(n)、O(n)；
```CPP
// 基本操作-删除数据
bool ListDelete(Seqlist& L, int i, int& e)
{
    // 检测输入是否有效
    if (i <= 0 || i > L.length)
    {
        return false;
    }

    e = L.data[i - 1]; // 获取被删除的值
    // 将i位后所有数字往前移
    for (int j = i; j < L.length; j++)
    {
        L.data[j - 1] = L.data[j];
    }

    L.length--; //更新数组长度
    return true;
}
```
3. 按位查找：时间复杂度：O(1)、O(1)、O(1)；
```CPP
// 基本操作-按位查找
int ListGetElem(Seqlist& L, int i)
{
    // 检测输入是否有效
    if (i <= 0 || i > L.length)
    {
        return INT_MIN;
    }

    return L.data[i - 1];
}
```
4. 按值查找：时间复杂度：O(1)、O(n)、O(n)；
```CPP
// 基本操作-按值查找
int ListLocateElem(Seqlist& L, int e)
{
    for (int i = 0; i < L.length; i++)
    {
        if (L.data[i] == e)
        {
            return i + 1;
        }
    }

    return -1;
}
```

### 2. 单链表
基本操作：
1. 插入：
```CPP
// 基本操作-插入数据
bool ListInsert(LinkList &L, int i,int e)
{
    // 检测输入是否有效
    if(i < 1)
    {
        return false;
    }

    LNode *p;   // 指针P指向当前扫描到的节点
    int j = 0;  // 当前P指向的是第几个节点
    p = L;      // P指向头节点
    // 循环寻找第i-1个节点
    while(p != nullptr && j < i-1)
    {
        p = p->next;
        j++;
    }
    // 检测p是否合法
    if(p == nullptr)
    {
        return false;
    }
    LNode *s = new LNode();
    s->data = e;
    // 将新节点s插入i位置，并重新连接链表
    s->next = p->next;
    p->next = s;

    return true;
}
```
2. 删除：
```CPP
// 基本操作-删除数据
bool ListDelete(LinkList &L,int i,int &e)
{
    // 检测输入是否有效
    if(i < 1)
    {
        return false;
    }

    LNode *p = L;   // 指针P指向当前扫描到的节点
    int j = 0;      // 当前p指向的是第几个节点
    // 循环找到第i-1个节点
    while(p != nullptr && j < i-1)
    {
        p = p->next;
        j++;
    }
    // 检测p以及p的下一个要被删除的数是否有效
    if(p == nullptr || p->next == nullptr)
    {
        return false;
    }
    LNode *q = p->next; // 保存被删除的指针
    e = q->data;        // 返回删除的值
    p->next = q->next;  // 重新链接
    delete q;           // 释放指针
    return true;
}
```
3. 按位查找：
```CPP
// 基本操作-按位查找
LNode* GetElem(LinkList L,int i)
{
    // 检测输入是否有效
    if(i < 0)
    {
        return nullptr;
    }

    LNode* p = L;   // 指针p指向当前扫描到的节点
    int j = 0;      // 当前p指向的是第几个节点
    // 循环寻找第i个节点
    while(p != nullptr && j < i)
    {
        p = p->next;
        j++;
    }

    return p;
}
```
4. 按值查找：
```CPP
// 基本操作-按值查找
LNode* LocateElem(LinkList L,int e)
{
    LNode *p = L->next;
    // 循环查找
    while(p != nullptr && p->data != e)
    {
        p = p->next;
    }

    return p;   // 返回指针，不存在则返回nullptr
}
```
5. 求表长：
```CPP
// 求表长度
int Length(LinkList L)
{
    int len = 0;    // 统计表长
    LNode *p = L;
    while(p != nullptr)
    {
        p = p->next;
        len++;
    }
    return len;
}
```
6. 尾插法创建单链表：
```CPP
// 尾插法建立单链表
LinkList List_TailInsert(LinkList &L)   // 正向建立单链表
{
    int x;
    L = new LNode();    // 建立头指针
    LNode *s = nullptr;
    LNode *r = L;    // r为表尾指针
    std::cin >> x;      // 输入节点的值
    while (x != 9999)
    {
        s = new LNode();
        s->data = x;
        r->next = s;
        r = s;          // r指向新的表尾节点
        std::cin >> x;
    }

    r->next = nullptr;  // 尾节点指针置空
    return L;
}
```
7. 头插法创建单链表：
```CPP
// 头插法建立单链表
LinkList List_HeadInsert(LinkList &L)   // 逆向建立单链表
{
    LNode *s = nullptr;
    int x;              // 记录用户输入的值
    L = new LNode();    // 创建头指针
    L->next = nullptr;  // 初始化头指针
    std::cin >> x;      // 用户输入
    while (x != 9999)
    {
        s = new LNode();// 创建新节点
        s->data = x;
        s->next = L->next;
        L->next = s;
        std::cin >> x;
    }

    return L;
}
```

### 3.  双链表
基本操作：
1. 插入：
```CPP
bool InsertNextDNode(DNode *p,DNode *s)
{
    // 检测输入是否为空
    if(p == nullptr || s == nullptr)
    {
        return false;
    }

    s->next = p->next;
    if(p->next != nullptr)  //判断是否存在需要更改前驱的节点
    {
        p->next->prior = s;
    }
    s->prior = p;
    p->next = s;

    return true;
}
```
2. 删除：
```CPP
bool DeleteNextDNode(DNode *p)
{
    // 检测输入是否有效
    if(p == nullptr)
    {
        return false;
    }
    DNode *q = p->next; // 储存删除节点
    if(q == nullptr)
    {
        return false;   // 无需要删除的节点
    }
    p->next = q->next;
    
    if(q->next != nullptr)
    {
        q->next->prior = p;
    }
    delete q;           // 释放节点空间

    return true;
}
```
3. 清空：
```CPP
// 清空整个双向链表
void DestoryList(DLinklist &L)
{
    // 循环释放各个数据节点
    while(L->next != nullptr)
    {
        DeleteNextDNode(L);
    }
    delete L;       // 释放头指针
    L = nullptr;    // 初始化头指针
}
```

### 4. 循环单链表

### 5. 循环双链表

### 6. 静态链表（数组实现链表）
优点：增、删操作不需要大量移动元素
缺点：不能随机存取，只能从头节点开始依次往后查找；容量固定不可变。
适用场景：
1. 不支持指针的低级语言；
2. 数据元素数量固定不变：操作系统的文件分配表FAT

### 7.  顺序栈
只允许在一端进行插入或删除操作的线性表
基本操作：
1. 入栈：
```CPP
// 基本操作-入栈
bool Push(SeqStack &S,int x)
{
    // 判断栈是否满
    if(S.top == MaxSize-1)
    {
        return false;
    }

    S.data[++S.top] = x;    //元素入栈
    return true;
}
```
2. 出栈：
```CPP
// 基本操作-出栈
bool Pop(SeqStack &S,int &x)
{
    if(S.top == -1)         // 栈空，返回
        {
        return false;
        }
    x = S.data[S.top--];    // 栈顶元素先出栈，指针再减一
    
    return true;
}
```
3. 读取栈顶元素：
```CPP
// 基本操作-读取栈顶元素
bool GetTop(SeqStack S,int &x)
{
    if(S.top == -1)     // 栈空，返回
        {
        return false;
        }
    x = S.data[S.top];  //  返回栈顶元素
    return true;
}
```

### 8. 链栈
与单链表无异

### 9. 顺序队列
只允许在一端进行插入，在另一端删除的线性表
基本操作
1. 入队：
```CPP
// 基本操作-入队
bool EnQueue(SeqQueue &Q,int x)
{
    // 判断是否队满
    if((Q.rear + 1)%MaxSize == Q.front)
    {
        return false;
    }
    Q.data[Q.rear] = x;                 // 新元素插入队尾
    Q.rear = (Q.rear + 1) % MaxSize;    // 形成循环队列
    return true;
}
```
2. 出队：
```CPP
// 基本操作-出队
bool DeQueue(SeqQueue &Q,int &x)
{
    // 判断队列是否为空
    if(QueueEmpty(Q))
    {
        return false;
    }

    x = Q.data[Q.front];
    Q.front = (Q.front + 1) % MaxSize;

    return true;
}
```
3. 获取头元素：
```CPP
// 获取队头元素
bool GetHead(SeqQueue Q,int &x)
{
    // 判断队列是否为空
    if(QueueEmpty(Q))
    {
        return false;
    }
    x = Q.data[Q.front];
    return true;
}
```

### 10. 链队
基本操作
1. 入队
```CPP
// 基本操作-入队
void EnQueue(LinkQueue &Q, int x)
{
    LinkNode *s = new LinkNode();
    s->data = x;
    s->next = nullptr;
    Q.rear->next = s;   // 将新节点插入到尾部
    Q.rear = s;         // 修改表尾指针
}
```
2. 出队
```CPP
// 基本操作-出队
bool DeQueue(LinkQueue &Q,int &x)
{
    // 判断是否为空队列
    if(Q.front == Q.rear)
    {
        return false;
    }

    LinkNode *p = Q.front->next;
    x = p->data;                // 获取出队值
    Q.front->next = p->next;    // 修改头指针
    // 检测是否为最后一个节点,需要修改rear指针指向
    if(Q.rear == p)             
    {
        Q.rear = Q.front;
    }

    delete p;
    return true;
}
```

### 11. 双端队列
只允许从两端插入、两端删除的线性表

### 12. 串
即字符串是由零个或多个字符组成的有限序列。
KMP算法


## 2. 树与图

### 1. 树
1. 二叉树
	1. 满二叉树：所有非叶子节点的节点都有两个子节点。
	2. 完全二叉树：在满二叉树的基础上，从最后面删除叶子节点
	3. 二叉排序树（BST）：
	   * 左子树上所有结点的关键字均小于根节点的关键字，
	   * 右子树上所有结点的关键字均大于根结点的关键字，
	   * 左右子树又各是一颗二叉排序树。
	4. 平衡二叉树（AVL）：树上任一结点的左子树和右子树的深度之差不超过1。
	   优点：减少二叉树元素查找的深度，从而提升平均查找效率。
	5. 线索二叉树：将叶子结点和未满孩子的结点的孩子指针利用起来，按照某种遍历顺序串起来。
	6. 哈夫曼树：在含有n个带权叶结点的二叉树中，其中带权路径长度（WPL）最小的二叉树称为哈夫曼树，也称最优二叉树。

### 2. 图
存储方式：
1. 邻接矩阵法
2. 邻接表法
3. 十字链表（存储有向图）
4. 邻接多重表（存储无向图）

图遍历：
1. BFS
2. DFS

求最小生成树：
1. Prim算法
2. Kruskal 算法

最短路径：
单源最短路径：
1. BFS算法
2. Dijkstra算法
各顶点间的最短路径：
1. Floyd算法

有向无环图（DAG）：
若一个有向图中不存在环，则称为有向无环图，简称DAG图；
AOV网：
用顶点表示活动网；
拓扑排序



# 三、查找
1. 顺序查找
2. 折半查找：仅适用于有序的顺序表
3. 分块查找：
4. B树（多路平衡查找树）
5. B+树
6. 散列查找（哈希表）
解决冲突：
1. 开放定址法：线性探测再散列、二次(平方)探测再散列、伪随机探测再散列
2. 再哈希法
3. 链地址法
4. 建立公共溢出区


# 四、排序
1. 插入排序
2. 希尔排序
3. 冒泡排序
4. 快速排序
   快速排序的基本思想：通过一趟排序将待排记录分隔成独立的两部分，其中一部分记录的关键字均比另一部分的关键字小，则可分别对这两部分记录继续进行排序，以达到整个序列有序。
   
5. 简单选择排序
6. 堆排序
7. 归并排序
8. 基数排序
9. 外部排序
10. 败者树
11. 置换和选择排序
12. 最佳归并树


### 排序算法的时间复杂度
*[图片未在原笔记仓库中找到]*
