---
title: TLS和SSL传输
date: 2025-05-25 18:20:00+0800
categories:
    - Network
---

> 最近研究Godot的多人联机，阅读文档发现TLS和SSL协议

### TLS/SSL 分步解析

#### 一、核心概念
**TLS (Transport Layer Security)** 和 **SSL (Secure Sockets Layer)** 是加密网络通信的协议，用于保护客户端与服务器之间的数据传输安全。  
- **SSL** 是早期版本（已淘汰，如 SSL 3.0）  
- **TLS** 是现代标准（如 TLS 1.2/1.3）  
- **核心功能**：加密传输、身份验证、数据完整性

#### 二、工作流程（以 HTTPS 为例）
1. **握手阶段**（Handshake）  
   - 客户端发送支持的协议版本和加密算法列表  
   - 服务器返回证书和选择的加密方案  
   - 客户端验证证书合法性，生成会话密钥  
   - 双方通过非对称加密交换会话密钥  

2. **数据传输**  
   - 使用对称加密（如 AES）加密实际数据  
   - 通过哈希算法（如 SHA-256）验证数据完整性  

#### 三、代码实现示例（Python）
```python
import requests

# 示例1：强制验证SSL证书（默认行为）
response = requests.get("https://example.com", verify=True)
# verify=True 会检查服务器证书是否由可信CA签发

# 示例2：忽略证书验证（仅测试环境使用！）
response = requests.get("https://self-signed.badssl.com/", verify=False)
# 会抛出 InsecureRequestWarning 警告，生产环境禁止使用

# 示例3：指定自定义CA证书
response = requests.get("https://example.com", verify="/path/to/custom_ca_bundle.pem")
```

#### 四、关键组件解析
| 组件                | 作用                          | 技术细节                     |
|---------------------|-------------------------------|------------------------------|
| 证书颁发机构(CA)     | 颁发数字证书的受信任实体       | 如 Let's Encrypt（免费CA）   |
| X.509 证书           | 包含公钥、域名、有效期等信息   | PEM/DER 格式                 |
| TLS 握手协议         | 协商加密参数的初始化过程       | 使用 Diffie-Hellman 密钥交换 |
| AES-256-GCM          | 对称加密算法                   | 提供机密性和完整性保护       |

#### 五、常见代码问题解决方案
1. **证书验证失败**  
   ```python
   # 错误示例（生产环境禁止！）
   requests.get("https://expired.badssl.com/", verify=False)
   
   # 正确做法：更新证书或配置CA路径
   response = requests.get("https://example.com", verify="/etc/ssl/certs/ca-certificates.crt")
   ```

2. **自签名证书使用**  
   ```bash
   # 生成自签名证书（OpenSSL）
   openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
   ```

3. **Node.js HTTPS 服务端示例**
   ```javascript
   const https = require('https');
   const fs = require('fs');

   const options = {
     key: fs.readFileSync('server.key'),
     cert: fs.readFileSync('server.cert')
   };

   https.createServer(options, (req, res) => {
     res.end('Secure connection established!');
   }).listen(443);
   ```

#### 六、安全最佳实践
1. **必须验证证书**（禁用验证仅限测试环境）
2. **使用最新协议版本**（优先 TLS 1.3）
3. **定期轮换证书**（Let's Encrypt 证书有效期 90 天）
4. **配置HSTS头**  
   ```nginx
   # Nginx 配置示例
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   ```

#### 七、工具链扩展
1. **OpenSSL 命令**  
   ```bash
   # 查看证书详情
   openssl x509 -in certificate.pem -text -noout
   
   # 测试TLS连接
   openssl s_client -connect example.com:443 -tls1_2
   ```

2. **在线检测工具**  
   - [SSL Labs Test](https://www.ssllabs.com/ssltest/)  
   - [Why No Padlock?](https://www.whynopadlock.com/)

#### 八、技术演进路线
```
SSL 2.0 → SSL 3.0 → TLS 1.0 → TLS 1.1 → TLS 1.2 → TLS 1.3
```
- TLS 1.3 移除了不安全算法（如 SHA-1、RC4）
- 支持 0-RTT 连接（需谨慎使用）

#### 九、典型错误模式
| 错误现象                  | 可能原因                      | 解决方案                     |
|---------------------------|-------------------------------|------------------------------|
| ERR_CERT_AUTHORITY_INVALID | 证书CA不在信任链             | 更新系统CA证书库             |
| ERR_CONNECTION_TIMED_OUT   | 防火墙阻断443端口            | 检查网络策略                 |
| ERR_SSL_PROTOCOL_ERROR     | 服务器配置了不兼容的协议版本 | 强制使用 TLS 1.2+            |

#### 十、进阶学习方向
1. **证书透明度（Certificate Transparency）**  
2. **零信任网络架构**  
3. **Post-Quantum Cryptography**（抗量子计算攻击算法）

> 💡 关键点：TLS/SSL 的核心价值在于通过密码学手段建立网络通信的信任链条，理解其工作原理有助于编写安全的代码并排查加密相关故障。