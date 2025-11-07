# Geims - 微信小程序

这是一个基础的微信小程序项目模板。

## 项目结构

```
geims/
├── app.js                  # 小程序逻辑
├── app.json                # 小程序公共配置
├── app.wxss                # 小程序公共样式表
├── project.config.json     # 项目配置文件
├── sitemap.json           # 站点地图配置
├── pages/                 # 页面文件夹
│   ├── index/            # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── logs/             # 日志页面
│       ├── logs.js
│       ├── logs.json
│       ├── logs.wxml
│       └── logs.wxss
└── utils/                # 工具函数
    └── util.js
```

## 开发指南

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 在微信开发者工具中导入本项目
3. 开始开发

## 功能特性

- 基础的页面结构（首页和日志页面）
- 用户信息获取
- 启动日志记录
- 标准的项目配置

## 技术栈

- 微信小程序原生框架
- WXML + WXSS + JavaScript

## 许可证

MIT