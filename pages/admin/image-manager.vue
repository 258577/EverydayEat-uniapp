<template>
  <view class="container">
    <view class="header">
      <view class="title">图片管理</view>
    </view>

    <view class="upload-section">
      <view class="section-title">上传新图片</view>
      <view class="form-item">
        <text class="label">图片名称</text>
        <input
          class="input"
          v-model="newImage.name"
          placeholder="输入图片名称"
        />
      </view>
      <view class="form-item">
        <text class="label">展示标题</text>
        <input
          class="input"
          v-model="newImage.title"
          placeholder="输入展示标题"
        />
      </view>
      <view class="form-item">
        <text class="label">按钮颜色</text>
        <input
          class="input"
          v-model="newImage.buttonColor"
          placeholder="#3498db"
        />
      </view>
      <view class="form-item">
        <text class="label">图片分类</text>
        <input
          class="input"
          v-model="newImage.category"
          placeholder="输入分类"
        />
      </view>
      <view class="form-item">
        <text class="label">图片描述</text>
        <textarea
          class="textarea"
          v-model="newImage.description"
          placeholder="输入图片描述"
        ></textarea>
      </view>
      <view class="form-item">
        <text class="label">选择图片</text>
        <button class="upload-btn" @click="chooseImage">选择图片</button>
        <image
          v-if="tempFilePath"
          class="preview-image"
          :src="tempFilePath"
          mode="aspectFit"
        ></image>
      </view>
      <button class="submit-btn" @click="uploadImage" :disabled="uploading">
        {{ uploading ? "上传中..." : "上传图片" }}
      </button>
    </view>

    <view class="image-list">
      <view class="section-title">图片列表</view>
      <view class="list-header">
        <text class="header-item header-name">名称</text>
        <text class="header-item header-category">分类</text>
        <text class="header-item header-action">操作</text>
      </view>

      <view v-if="loading" class="loading">加载中...</view>
      <view v-else-if="images.length === 0" class="empty">暂无图片</view>
      <view v-else class="list-content">
        <view v-for="item in images" :key="item._id" class="list-item">
          <view class="item-info">
            <view class="item-name">{{ item.name }}</view>
            <view class="item-category">{{ item.category || "未分类" }}</view>
          </view>
          <view class="item-actions">
            <view class="action-btn preview-btn" @click="previewImage(item)"
              >预览</view
            >
            <view class="action-btn delete-btn" @click="confirmDelete(item)"
              >删除</view
            >
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { onShow } from "@dcloudio/uni-app";

export default {
  data() {
    return {
      images: [],
      loading: false,
      uploading: false,
      tempFilePath: "",
      newImage: {
        name: "",
        title: "",
        buttonColor: "#3498db",
        category: "",
        description: "",
      },
    };
  },
  onLoad() {
    this.loadImages();
  },
  onShow() {
    // 每次页面显示时刷新图片列表
    this.loadImages();
  },
  methods: {
    // 加载图片列表
    async loadImages() {
      this.loading = true;
      try {
        const res = await uniCloud.callFunction({
          name: "images",
          data: {
            action: "getAllImages",
          },
        });

        if (res.result && res.result.code === 0) {
          this.images = res.result.data || [];
        } else {
          uni.showToast({
            title: "加载图片失败",
            icon: "none",
          });
        }
      } catch (e) {
        console.error("加载图片列表出错:", e);
        uni.showToast({
          title: "加载图片失败",
          icon: "none",
        });
      } finally {
        this.loading = false;
      }
    },

    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.tempFilePath = res.tempFilePaths[0];
        },
        fail: (err) => {
          console.error("选择图片失败:", err);
        },
      });
    },

    // 上传图片
    async uploadImage() {
      // 验证表单
      if (!this.newImage.name) {
        uni.showToast({
          title: "请输入图片名称",
          icon: "none",
        });
        return;
      }

      if (!this.tempFilePath) {
        uni.showToast({
          title: "请选择图片",
          icon: "none",
        });
        return;
      }

      this.uploading = true;

      try {
        // 1. 上传图片到云存储
        const uploadRes = await uniCloud.uploadFile({
          filePath: this.tempFilePath,
          cloudPath: `images/${Date.now()}-${
            this.newImage.name
          }.${this.tempFilePath.split(".").pop()}`,
        });

        // 2. 将图片信息保存到数据库
        const token = uni.getStorageSync("token");
        const uid = uni.getStorageSync("uid");

        const res = await uniCloud.callFunction({
          name: "images",
          data: {
            action: "addImage",
            name: this.newImage.name,
            title: this.newImage.title || this.newImage.name,
            url: uploadRes.fileID,
            buttonColor: this.newImage.buttonColor || "#3498db",
            category: this.newImage.category || "default",
            description: this.newImage.description || "",
            token,
            uid,
          },
        });

        if (res.result && res.result.code === 0) {
          uni.showToast({
            title: "上传成功",
            icon: "success",
          });

          // 清空表单
          this.newImage = {
            name: "",
            title: "",
            buttonColor: "#3498db",
            category: "",
            description: "",
          };
          this.tempFilePath = "";

          // 刷新图片列表
          this.loadImages();
        } else {
          uni.showToast({
            title: res.result.message || "上传失败",
            icon: "none",
          });
        }
      } catch (e) {
        console.error("上传图片出错:", e);
        uni.showToast({
          title: "上传失败",
          icon: "none",
        });
      } finally {
        this.uploading = false;
      }
    },

    // 预览图片
    previewImage(item) {
      uni.previewImage({
        urls: [item.url],
        current: 0,
      });
    },

    // 确认删除图片
    confirmDelete(item) {
      uni.showModal({
        title: "确认删除",
        content: `确定要删除图片"${item.name}"吗？`,
        success: (res) => {
          if (res.confirm) {
            this.deleteImage(item._id);
          }
        },
      });
    },

    // 删除图片
    async deleteImage(id) {
      try {
        const token = uni.getStorageSync("token");
        const uid = uni.getStorageSync("uid");

        const res = await uniCloud.callFunction({
          name: "images",
          data: {
            action: "deleteImage",
            id,
            token,
            uid,
          },
        });

        if (res.result && res.result.code === 0) {
          uni.showToast({
            title: "删除成功",
            icon: "success",
          });

          // 刷新图片列表
          this.loadImages();
        } else {
          uni.showToast({
            title: res.result.message || "删除失败",
            icon: "none",
          });
        }
      } catch (e) {
        console.error("删除图片出错:", e);
        uni.showToast({
          title: "删除失败",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  margin-bottom: 30rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
  border-left: 8rpx solid #3498db;
  padding-left: 20rpx;
}

.upload-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 20rpx;

  .label {
    display: block;
    font-size: 28rpx;
    margin-bottom: 10rpx;
    color: #666;
  }

  .input {
    width: 100%;
    height: 80rpx;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }

  .textarea {
    width: 100%;
    height: 160rpx;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    padding: 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }
}

.upload-btn {
  background-color: #f0f0f0;
  color: #666;
  font-size: 28rpx;
  padding: 20rpx 0;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.preview-image {
  width: 100%;
  height: 300rpx;
  border-radius: 8rpx;
  margin-top: 20rpx;
}

.submit-btn {
  background-color: #3498db;
  color: #fff;
  font-size: 32rpx;
  padding: 20rpx 0;
  border-radius: 8rpx;
  margin-top: 20rpx;

  &:active {
    opacity: 0.8;
  }
}

.image-list {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.list-header {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
  font-weight: bold;

  .header-item {
    font-size: 28rpx;
    color: #666;
  }

  .header-name {
    flex: 2;
  }

  .header-category {
    flex: 1;
  }

  .header-action {
    flex: 1;
    text-align: center;
  }
}

.loading,
.empty {
  padding: 40rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .item-info {
    flex: 3;

    .item-name {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 8rpx;
    }

    .item-category {
      font-size: 24rpx;
      color: #999;
    }
  }

  .item-actions {
    flex: 1;
    display: flex;
    justify-content: flex-end;

    .action-btn {
      padding: 10rpx 20rpx;
      font-size: 24rpx;
      border-radius: 6rpx;
      margin-left: 10rpx;
    }

    .preview-btn {
      background-color: #f0f0f0;
      color: #666;
    }

    .delete-btn {
      background-color: #ff5252;
      color: #fff;
    }
  }
}
</style> 