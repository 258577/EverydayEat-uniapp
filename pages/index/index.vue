<template>
  <view class="content">
    <!-- 头部区域 -->
    <view class="header-new">
      <view v-if="userInfo">
        <image src="../../static/logo.jpg" mode="aspectFill" style="border-radius: 50%;width: 50rpx;height: 50rpx;"></image>
      </view>
      <view class="login-btn" v-else @click="navToLogin">
        <text>请登录</text>
      </view>
      <view class="create-btn" @click="showCreateMenuPopup">
        <text>创建菜单</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="section-title">
        <text>我的菜单</text>
      </view>
      <view class="empty" v-if="menuList.length === 0">
        <image src="/static/images/empty.png" mode="aspectFit"></image>
        <text>暂无菜单，快去创建吧</text>
      </view>
      <view
        class="menu-item"
        v-for="(item, index) in menuList"
        :key="index"
        @click="navToMenu(item._id)"
        @longpress="handleMenuLongPress(item)"
      >
        <view class="menu-info">
          <view class="menu-name">
            {{ item.name }}
          </view>
          <view class="menu-date">{{ formatDate(item.create_date) }}</view>
          <view class="menu-status" :class="getStatusClass(item.status)">
            {{ getStatusText(item.status) }}
          </view>
        </view>
        <view class="menu-participants">
          <image
            v-for="(participant, i) in limitedParticipants(
              item.participants_info
            )"
            :key="`participant-${i}`"
            class="participant-avatar"
            :src="participant.avatar"
            mode="aspectFill"
          >
          </image>
          <view class="more" v-if="item.participants_info.length > 5">
            +{{ item.participants_info.length - 5 }}
          </view>
        </view>
        <uni-icons type="right" size="16" color="#CCCCCC"></uni-icons>
      </view>
    </view>

    <!-- 底部区域 -->
    <view class="loading" v-if="loading">
      <uni-load-more status="loading"></uni-load-more>
    </view>
    <view class="no-more" v-else-if="menuList.length > 0">
      <uni-load-more status="noMore"></uni-load-more>
    </view>

    <!-- 创建菜单弹窗 - 自定义实现 -->
    <view
      class="custom-popup-mask"
      v-if="showCreateMenuDialog"
      @click="closeCreateMenuPopup"
    ></view>
    <view class="custom-popup" v-if="showCreateMenuDialog">
      <view class="popup-content">
        <view class="popup-title">创建菜单</view>
        <view class="popup-form">
          <view class="form-item">
            <text class="form-label">菜单名称</text>
            <input
              class="form-input"
              v-model="menuForm.name"
              placeholder="请输入菜单名称"
              maxlength="20"
            />
          </view>
          <view class="form-item">
            <text class="form-label">菜单描述</text>
            <textarea
              class="form-textarea"
              v-model="menuForm.description"
              placeholder="请输入菜单描述"
              maxlength="100"
            />
          </view>
        </view>
        <view class="popup-buttons">
          <button class="cancel-btn" @click="closeCreateMenuPopup">取消</button>
          <button class="confirm-btn" @click="createMenu">创建</button>
        </view>
      </view>
    </view>

    <!-- 编辑菜单弹窗 -->
    <view
      class="custom-popup-mask"
      v-if="showEditMenuDialog"
      @click="closeEditMenuPopup"
    ></view>
    <view class="custom-popup" v-if="showEditMenuDialog">
      <view class="popup-content">
        <view class="popup-title">编辑菜单</view>
        <view class="popup-form">
          <view class="form-item">
            <text class="form-label">菜单名称</text>
            <input
              class="form-input"
              v-model="editMenuForm.name"
              placeholder="请输入菜单名称"
              maxlength="20"
            />
          </view>
          <view class="form-item">
            <text class="form-label">菜单描述</text>
            <textarea
              class="form-textarea"
              v-model="editMenuForm.description"
              placeholder="请输入菜单描述"
              maxlength="100"
            />
          </view>
        </view>
        <view class="popup-buttons">
          <button class="cancel-btn" @click="closeEditMenuPopup">取消</button>
          <button class="confirm-btn" @click="updateMenu">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { onPullDownRefresh } from "@dcloudio/uni-app";

// 用户信息
const userInfo = ref(null);
// 菜单列表
const menuList = ref([]);
// 加载状态
const loading = ref(false);
// 控制创建菜单弹窗显示
const showCreateMenuDialog = ref(false);
// 控制编辑菜单弹窗显示
const showEditMenuDialog = ref(false);
// 菜单表单
const menuForm = ref({
  name: "",
  description: "",
});
// 编辑菜单表单
const editMenuForm = ref({
  id: "",
  name: "",
  description: "",
});

// 获取用户信息
const getUserInfo = () => {
  const user = uni.getStorageSync("userInfo");
  if (user) {
    userInfo.value = user;
    getUserMenus();
  }
};

// 获取菜单列表
const getUserMenus = async () => {
  if (!userInfo.value) return;

  loading.value = true;
  try {
    // 获取token
    const token = uni.getStorageSync("token");

    const res = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "getUserMenus",
        token: token, // 传递token给云函数
        uid: userInfo.value._id, // 同时传递用户ID作为备用
      },
    });

    if (res.result.code === 0) {
      menuList.value = res.result.data;
    } else {
      uni.showToast({
        title: res.result.msg,
        icon: "none",
      });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({
      title: "获取菜单列表失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
    uni.stopPullDownRefresh();
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0:
    case "pending":
      return "进行中";
    case 1:
    case "adding":
      return "加菜中";
    case 2:
    case "completed":
      return "已完成";
    default:
      return "未知";
  }
};

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 0:
    case "pending":
      return "status-pending";
    case 1:
    case "adding":
      return "status-adding";
    case 2:
    case "completed":
      return "status-completed";
    default:
      return "";
  }
};

// 跳转到登录页
const navToLogin = () => {
  uni.navigateTo({
    url: "/pages/login/login",
  });
};

// 显示创建菜单弹窗
const showCreateMenuPopup = () => {
  if (!userInfo.value) {
    return navToLogin();
  }

  // 重置表单
  menuForm.value = {
    name: "",
    description: "",
  };

  // 打开弹窗
  showCreateMenuDialog.value = true;
};

// 关闭创建菜单弹窗
const closeCreateMenuPopup = () => {
  showCreateMenuDialog.value = false;
};

// 创建菜单
const createMenu = async () => {
  // 表单验证
  if (!menuForm.value.name.trim()) {
    uni.showToast({
      title: "请输入菜单名称",
      icon: "none",
    });
    return;
  }

  // 显示加载中
  uni.showLoading({
    title: "创建中...",
    mask: true,
  });

  try {
    // 获取token
    const token = uni.getStorageSync("token");

    const res = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "createMenu",
        name: menuForm.value.name,
        description: menuForm.value.description || "",
        token: token,
        uid: userInfo.value._id,
      },
    });

    if (res.result.code === 0) {
      // 关闭弹窗
      closeCreateMenuPopup();

      // 刷新菜单列表
      getUserMenus();

      // 提示创建成功
      uni.showToast({
        title: "创建成功",
        icon: "success",
      });

      // 跳转到菜单详情页
      setTimeout(() => {
        navToMenu(res.result.data.menu_id);
      }, 500);
    } else {
      throw new Error(res.result.msg);
    }
  } catch (e) {
    console.error(e);
    uni.showToast({
      title: "创建菜单失败: " + e.message,
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 跳转到菜单详情页
const navToMenu = (menuId) => {
  uni.navigateTo({
    url: `/pages/menu/menu?id=${menuId}`,
  });
};

// 长按菜单项
const handleMenuLongPress = (menu) => {
  // 检查是否为创建者
  if (menu.creator_id !== userInfo.value._id) {
    uni.showToast({
      title: "只有创建者可以删除菜单",
      icon: "none",
    });
    return;
  }

  // 弹出确认框
  uni.showModal({
    title: "删除菜单",
    content: `确定要删除菜单"${menu.name}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        await deleteMenu(menu._id);
      }
    },
  });
};

// 删除菜单
const deleteMenu = async (menuId) => {
  uni.showLoading({
    title: "删除中...",
    mask: true,
  });

  try {
    const token = uni.getStorageSync("token");
    const uid = userInfo.value._id;

    const res = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "deleteMenu",
        menu_id: menuId,
        token: token,
        uid: uid,
      },
    });

    if (res.result && res.result.code === 0) {
      // 从本地列表中移除
      menuList.value = menuList.value.filter((menu) => menu._id !== menuId);

      uni.showToast({
        title: "删除成功",
        icon: "success",
      });
    } else {
      throw new Error(res.result.message || "删除失败");
    }
  } catch (e) {
    console.error("删除菜单失败:", e);
    uni.showToast({
      title: "删除菜单失败: " + (e.message || "未知错误"),
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 下拉刷新
onPullDownRefresh(() => {
  getUserMenus();
});

// 页面挂载时
onMounted(() => {
  getUserInfo();
});

// 页面显示时
onShow(() => {
  console.log("首页显示");

  // 检查是否有菜单状态更新
  try {
    const menuStatusUpdated = uni.getStorageSync("menu_status_updated");
    if (menuStatusUpdated) {
      console.log("检测到菜单状态更新:", menuStatusUpdated);
      // 清除状态更新标记
      uni.removeStorageSync("menu_status_updated");
      // 刷新用户菜单列表
      getUserMenus();
    }
  } catch (e) {
    console.error("检查菜单状态更新出错:", e);
  }

  // 执行原有的逻辑
  getUserInfo();
});

// 限制显示的参与者数量，并兼容头像昵称字段
const limitedParticipants = (participants) => {
  if (!participants) return [];
  return participants
    .map((p) => ({
      ...p,
      avatar: p.avatar || p.avatarUrl,
      nickname: p.nickname || p.nickName,
    }))
    .slice(0, 5);
};

// 显示编辑菜单弹窗
const showEditMenuPopup = (menu) => {
  if (!userInfo.value) {
    return navToLogin();
  }

  // 检查是否为创建者
  if (menu.creator_id !== userInfo.value._id) {
    uni.showToast({
      title: "只有创建者可以编辑菜单",
      icon: "none",
    });
    return;
  }

  // 设置表单数据
  editMenuForm.value = {
    id: menu._id,
    name: menu.name,
    description: menu.description || "",
  };

  // 打开弹窗
  showEditMenuDialog.value = true;
};

// 关闭编辑菜单弹窗
const closeEditMenuPopup = () => {
  showEditMenuDialog.value = false;
};

// 更新菜单
const updateMenu = async () => {
  // 表单验证
  if (!editMenuForm.value.name.trim()) {
    uni.showToast({
      title: "请输入菜单名称",
      icon: "none",
    });
    return;
  }

  // 显示加载中
  uni.showLoading({
    title: "保存中...",
    mask: true,
  });

  try {
    // 获取token
    const token = uni.getStorageSync("token");

    const res = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "updateMenu",
        menuId: editMenuForm.value.id,
        update: {
          name: editMenuForm.value.name,
          description: editMenuForm.value.description || "",
        },
        token: token,
        uid: userInfo.value._id,
      },
    });

    if (res.result && res.result.code === 0) {
      // 关闭弹窗
      closeEditMenuPopup();

      // 刷新菜单列表
      getUserMenus();

      // 提示保存成功
      uni.showToast({
        title: "修改成功",
        icon: "success",
      });
    } else {
      throw new Error(res.result?.message || res.result?.msg || "修改失败");
    }
  } catch (e) {
    console.error(e);
    uni.showToast({
      title: "修改菜单失败: " + e.message,
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};
</script>

<style>
.content {
  padding: 30rpx;
  background-color: #f8f8f8; 
  min-height: 100vh;
}

.header-new {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0); 
}

.user-info {
  display: flex;
}

.login-btn text {
  color: #666; 
  background: rgba(255, 255, 255, 0.5); 
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  font-weight: bold;
}

.create-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #ffcc80, #ffb74d); 
  color: #fff;
  border-radius: 30rpx;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 6rpx 15rpx rgba(255, 152, 0, 0.2);
  transition: all 0.3s ease;
}

.create-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(255, 152, 0, 0.2);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 30rpx;
  background: linear-gradient(135deg, #ffcc80, #ffb74d); 
  border-radius: 24rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 10rpx 25rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.menu-item::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 10rpx;
  background: linear-gradient(to bottom, #fb8c00, #f57c00);
  border-radius: 0 5rpx 5rpx 0;
}

.menu-item:active {
  transform: translateY(3rpx);
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffb74d, #ffa726);
}

.popup-content {
  width: 650rpx;
  background: linear-gradient(135deg, #ffd700, #ffc107); 
  border-radius: 30rpx;
  padding: 45rpx;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.2);
}

.confirm-btn {
  background: linear-gradient(135deg, #ff9800, #fb8c00);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(255, 152, 0, 0.3);
}

.confirm-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(255, 152, 0, 0.2);
}

.section-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  padding-left: 15rpx;
  position: relative;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 30rpx;
  background: linear-gradient(to bottom, #fa9153, #ff7048);
  border-radius: 3rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.05);
}

.empty image {
  width: 220rpx;
  height: 220rpx;
  margin-bottom: 20rpx;
  opacity: 0.8;
}

.empty text {
  color: #999;
  font-size: 28rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 30rpx;
  background-color: #ffffff;
  background-image: linear-gradient(
    to left,
    rgba(250, 145, 83, 0.15),
    rgba(255, 112, 72, 0.05) 60%,
    rgba(255, 255, 255, 0) 90%
  );
  border-radius: 16rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  border: 1rpx solid rgba(0, 0, 0, 0.03);
}

.menu-item::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  background: linear-gradient(to bottom, #fa9153, #ff7048);
  border-radius: 0 4rpx 4rpx 0;
}

.menu-item:active {
  transform: translateY(3rpx);
  box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.04);
  background-color: #ffffff;
  background-image: linear-gradient(
    to left,
    rgba(250, 145, 83, 0.08),
    rgba(255, 112, 72, 0.03) 60%,
    rgba(255, 255, 255, 0) 90%
  );
}

.menu-info {
  flex: 1;
  padding-left: 15rpx;
  padding-right: 15rpx;
}

.menu-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
}

.edit-menu-btn {
  margin-left: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  background-color: rgba(250, 145, 83, 0.15);
  border-radius: 50%;
  padding: 6rpx;
}

.menu-date {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.menu-status {
  display: inline-block;
  padding: 5rpx 15rpx;
  font-size: 22rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.status-pending {
  background: linear-gradient(135deg, #e6f7ff, #d0e8ff);
  color: #1890ff;
  border: 1rpx solid rgba(24, 144, 255, 0.2);
}

.status-adding {
  background: linear-gradient(135deg, #fff7e6, #ffefd0);
  color: #fa9153;
  border: 1rpx solid rgba(250, 145, 83, 0.2);
}

.status-completed {
  background: linear-gradient(135deg, #f6ffed, #e8f8e0);
  color: #52c41a;
  border: 1rpx solid rgba(82, 196, 26, 0.2);
}

.menu-participants {
  display: flex;
  align-items: center;
  margin-right: 15rpx;
}

.participant-avatar {
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  margin-left: -14rpx;
  border: 2rpx solid #fff;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.participant-avatar:first-child {
  margin-left: 0;
}

.more {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f5f5, #ebebeb);
  font-size: 20rpx;
  color: #999;
  margin-left: -14rpx;
  border: 2rpx solid #fff;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.loading,
.no-more {
  padding: 30rpx 0;
}

/* 自定义弹窗样式 */
.custom-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3rpx);
  z-index: 998;
}

.custom-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
}

.popup-content {
  width: 650rpx;
  background: linear-gradient(135deg, #ffffff, #f9f9f9);
  border-radius: 24rpx;
  padding: 45rpx;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.15);
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 40rpx;
  position: relative;
}

.popup-title::after {
  content: "";
  position: absolute;
  bottom: -15rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: linear-gradient(to right, #fa9153, #ff7048);
  border-radius: 2rpx;
}

.popup-form {
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: rgba(250, 250, 250, 0.6);
  transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: rgba(250, 145, 83, 0.3);
  box-shadow: 0 0 0 3rpx rgba(250, 145, 83, 0.1);
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: rgba(250, 250, 250, 0.6);
  transition: all 0.3s;
}

.popup-buttons {
  display: flex;
  justify-content: space-between;
}

.cancel-btn,
.confirm-btn {
  width: 45%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  transition: all 0.3s;
}

.cancel-btn {
  background: linear-gradient(135deg, #f5f5f5, #ececec);
  color: #666;
  box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.05);
}

.cancel-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.confirm-btn {
  background: linear-gradient(135deg, #fa9153, #ff7048);
  color: #fff;
  box-shadow: 0 6rpx 15rpx rgba(250, 145, 83, 0.25);
}

.confirm-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(250, 145, 83, 0.15);
}
</style>
