# EverydayFood - 自助菜单小程序

一个基于 uni-app 开发的微信小程序，用于菜单创建、菜品管理和在线下单模拟，帮助用户轻松解决「今天吃什么」的问题。

## 项目介绍

EverydayFood 是一款专为饭搭子间设计的菜单管理小程序，主要功能包括：
- 创建和管理家庭菜单
- 添加和分类菜品
- 模拟在线下单功能
- 查看历史订单记录
- 菜品图片管理

## 技术栈

- **前端框架**：uni-app
- **开发语言**：Vue.js
- **云服务**：uniCloud（阿里云）
- **UI组件**：自定义组件 + uni-ui
- **数据库**：NoSQL（uniCloud 数据库）

## 核心功能

### 1. 用户系统
- 用户登录/注册
- 个人信息管理

### 2. 菜单管理
- 创建新菜单
- 编辑菜单信息
- 查看菜单列表
- 菜单状态管理（进行中/已完成）

### 3. 菜品管理
- 添加菜品信息（名称、描述、价格、图片）
- 菜品分类管理
- 编辑和删除菜品
- 菜品图片上传和管理

### 4. 订单系统
- 加入购物车
- 提交订单
- 查看订单列表
- 订单详情查看
- 订单状态更新
- 删除订单（仅创建者）

### 5. 其他功能
- 意见反馈
- 工具集
- 图片管理后台

## 项目结构

```
├── App.vue                     # 应用入口文件
├── main.js                     # Vue实例初始化
├── pages.json                  # 页面路由配置
├── pages/                      # 页面目录
│   ├── index/                  # 首页
│   ├── login/                  # 登录页
│   ├── menu/                   # 菜单详情页
│   ├── order/                  # 订单页
│   ├── my/                     # 个人中心
│   ├── chat/                   # 意见反馈
│   ├── tool/                   # 工具页
│   └── admin/                  # 管理员页面
├── components/                 # 自定义组件
│   ├── ABCDSelector.vue        # ABCD选择器
│   ├── CustomSelector.vue      # 自定义选择器
│   ├── ImagePopup.vue          # 图片弹窗
│   ├── RandomSelector.vue      # 随机选择器
│   └── YesNoSelector.vue       # 是/否选择器
├── static/                     # 静态资源
│   └── images/                 # 图片资源
├── uniCloud-aliyun/            # uniCloud云函数和数据库
│   ├── cloudfunctions/         # 云函数
│   └── database/               # 数据库 schema
└── uni_modules/                # uni-app 插件
```

### 环境要求

- HBuilderX 3.0+
- 微信开发者工具
- uniCloud 开发者账号

### 页面截图
## 首页
<img width="375" height="791" alt="微信图片_20251215162205_131_6" src="https://github.com/user-attachments/assets/2a13a494-fb5b-4ba0-94db-8fa40ba6cae9" />
<img width="365" height="794" alt="微信图片_20251215162205_132_6" src="https://github.com/user-attachments/assets/a03a8c68-3df3-4827-957e-64ef7f747295" />

## 菜单页&订单页
<img width="359" height="790" alt="微信图片_20251215162205_125_6" src="https://github.com/user-attachments/assets/b695ed8a-8fcc-4dec-8d55-7fdfe4006d74" />
<img width="365" height="786" alt="微信图片_20251215162205_126_6" src="https://github.com/user-attachments/assets/5caf53d6-6408-4739-a16b-4cfaa1c20e26" />
<img width="369" height="786" alt="微信图片_20251215162205_127_6" src="https://github.com/user-attachments/assets/6fd39b82-9f32-41d7-9a37-6a65c63188ff" />
<img width="375" height="798" alt="微信图片_20251215162205_128_6" src="https://github.com/user-attachments/assets/c9797a2d-68f9-4abc-ae83-fe36f56878c6" />
<img width="375" height="789" alt="微信图片_20251215162205_129_6" src="https://github.com/user-attachments/assets/cd091b26-f5ad-4d9b-93e9-3a9c52d96bf4" />
<img width="375" height="790" alt="微信图片_20251215162205_130_6" src="https://github.com/user-attachments/assets/9246e979-780d-425d-835a-6d27d96607ce" />

## 工具页
<img width="366" height="785" alt="微信图片_20251215162205_133_6" src="https://github.com/user-attachments/assets/eeba6a6c-6b86-439f-8a91-9ab923ae7818" />
<img width="366" height="790" alt="微信图片_20251215165433_137_6" src="https://github.com/user-attachments/assets/ec0d3cb4-3a99-4f03-a93e-ee388a658b52" />

## 个人页
<img width="369" height="790" alt="微信图片_20251215162207_134_6" src="https://github.com/user-attachments/assets/c0470380-3dc3-4e1f-813d-486ee4308284" />
<img width="376" height="798" alt="微信图片_20251215162207_136_6" src="https://github.com/user-attachments/assets/c731941f-82bc-4495-9d37-5ea2c1272384" />


### 安装步骤

1. 克隆项目到本地
   ```bash
   git clone <repository-url>
   ```

2. 打开 HBuilderX，导入项目

3. 配置 uniCloud 云服务
   - 关联云服务空间
   - 上传云函数

4. 运行项目
   - 选择微信小程序运行环境
   - 打开微信开发者工具进行预览

## 主要页面说明

### 首页
- 显示用户菜单列表
- 提供创建新菜单入口
- 用户登录状态显示

### 菜单页
- 菜单详情展示
- 菜品分类和列表
- 菜品添加到购物车功能
- 购物车结算

### 工具页
- 各种随机选中工具
- 健康推荐卡片图

### 订单页
- 订单列表展示
- 订单状态管理
- 订单详情查看

### 个人中心
- 用户信息展示
- 功能入口集合

## 开发说明

### 云函数

项目使用 uniCloud 云函数处理后端逻辑，主要包括：
- `menu`：菜单相关操作
- `order`：订单相关操作
- `user`：用户相关操作
- `images`：健康卡片图片管理

### 数据库表结构

主要数据库表：
- `menu`：菜单信息
- `dish`：菜品信息
- `order`：订单信息
- `user`：用户信息
- `images`：健康卡片图片信息

## 未来规划

- [ ] 实现邀请好友功能
- [ ] 添加菜品评分和评论
- [ ] 支持多人实时编辑菜单
- [ ] 增加营养成分记录
- [ ] 实现数据统计和分析功能

## 注意事项

- 本项目为练习项目，仅用于学习和饭搭子内部使用
- 在线下单功能为模拟功能，不涉及真实支付
- 部分功能（如邀请好友）尚未完全实现

## 作者

个人练习项目，用于前端开发学习与实践。
