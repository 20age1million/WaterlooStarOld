# Docker 部署指南

这个目录包含了用于部署 Waterloo Star 前端应用的 Docker 配置文件。

## 文件说明

- `Dockerfile` - 多阶段构建的 Docker 文件
- `.dockerignore` - Docker 构建时忽略的文件
- `nginx.conf` - Nginx 服务器配置
- `docker-compose.yml` - Docker Compose 配置文件

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up --build

# 后台运行
docker-compose up -d --build

# 停止容器
docker-compose down
```

### 使用 Docker 命令

```bash
# 构建镜像
docker build -t waterloo-star-frontend .

# 运行容器
docker run -p 3000:80 waterloo-star-frontend
```

## 访问应用

应用将在以下地址可用：

- http://localhost:3000

## 构建说明

Dockerfile 使用多阶段构建：

1. **构建阶段**: 使用 Node.js 18 Alpine 镜像安装依赖并构建应用
2. **生产阶段**: 使用 Nginx Alpine 镜像提供静态文件服务

## 环境变量

可以通过环境变量配置应用：

```bash
# 设置生产环境
NODE_ENV=production
```

## 自定义配置

### 修改端口

在 `docker-compose.yml` 中修改端口映射：

```yaml
ports:
  - "8080:80" # 将本地端口改为 8080
```

### 自定义 Nginx 配置

修改 `nginx.conf` 文件来调整 Nginx 设置，如缓存策略、安全头等。

## 故障排除

### 构建失败

1. 确保 Docker 和 Docker Compose 已安装
2. 检查网络连接以下载依赖
3. 清理 Docker 缓存：`docker system prune -a`

### 应用无法访问

1. 检查端口是否被占用
2. 查看容器日志：`docker-compose logs`
3. 确保防火墙允许相应端口

## 生产部署建议

1. 使用 HTTPS（配置 SSL 证书）
2. 设置适当的资源限制
3. 配置日志轮转
4. 使用 Docker secrets 管理敏感信息
5. 设置健康检查
