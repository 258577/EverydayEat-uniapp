<template>
  <view class="menu-container">
    <!-- 菜单标题与描述 -->
    <view class="menu-header">
      <view class="header-main">
        <view class="header-left">
          <view class="menu-title">
            <text>{{ menuInfo.name }}</text>
            <view class="menu-status" v-if="menuInfo.status === 'completed'">
              <text>已完成</text>
            </view>
            <view
              class="edit-btn"
              v-if="isMenuCreator"
              @click="showEditMenuPopup"
            >
              <image src="/static/images/edit.png"></image>
            </view>
          </view>
          <view class="menu-description">{{ menuInfo.description }}</view>
        </view>
        <view class="header-right">
          <!-- 参与者信息和邀请按钮 -->
          <view class="menu-participants">
            <view class="participants-list">
              <image
                v-for="(participant, index) in visibleParticipants"
                :key="index"
                class="participant-avatar"
                :src="participant.avatar"
                mode="aspectFill"
              ></image>
              <view class="participants-count" v-if="participantsCount > 5"
                >+{{ participantsCount - 5 }}</view
              >
            </view>
            <view class="invite-btn" @click="inviteFriends">
              <uni-icons type="plusempty" size="14" color="#fff"></uni-icons>
              <text>点击右上角邀请好友</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 分类和菜品区域 -->
    <view class="menu-content">
      <!-- 左侧分类列表 -->
      <scroll-view scroll-y="true" class="category-list">
        <view
          class="category-item"
          :class="{ active: currentCategory === 'all' }"
          @click="switchCategory('all')"
          @longpress="canEdit && handleCategoryLongPress('all')"
        >
          <text>全部</text>
        </view>
        <view
          class="category-item"
          v-for="(category, index) in menuInfo.categories"
          :key="index"
          :class="{ active: currentCategory === category.category_id }"
          @click="switchCategory(category.category_id)"
          @longpress="
            canEdit &&
              handleCategoryLongPress(category.category_id, category.name)
          "
        >
          <text>{{ category.name }}</text>
        </view>
        <view class="add-category" @click="showAddCategoryPopup" v-if="canEdit">
          <uni-icons type="plusempty" size="16" color="#FA9153"></uni-icons>
          <text>添加分类</text>
        </view>
      </scroll-view>

      <!-- 右侧菜品列表 -->
      <scroll-view scroll-y="true" class="dish-list">
        <block v-if="currentCategoryDishes.length > 0">
          <view
            class="dish-item"
            v-for="(dish, index) in currentCategoryDishes"
            :key="index"
            @longpress="canEdit && handleDishLongPress(dish.dish_id, dish.name)"
          >
            <image
              class="dish-image"
              :src="dish.image"
              mode="aspectFill"
            ></image>
            <view class="dish-info">
              <view class="dish-name">{{ dish.name }}</view>
              <view class="dish-description">{{ dish.description }}</view>
              <view class="dish-price">¥{{ dish.price.toFixed(2) }}</view>
            </view>
            <view class="dish-actions">
              <view class="dish-count" v-if="getCartCount(dish.dish_id) > 0">
                <view class="minus" @click.stop="minusFromCart(dish)">
                  <image
                    src="/static/images/delete.png"
                    class="action-icon"
                  ></image>
                </view>
                <text class="count">{{ getCartCount(dish.dish_id) }}</text>
                <view class="plus" @click.stop="addToCart(dish)">
                  <image
                    src="/static/images/add.png"
                    class="action-icon"
                  ></image>
                </view>
              </view>
              <view class="add-btn" v-else @click.stop="addToCart(dish)">
                <image src="/static/images/add.png" class="action-icon"></image>
              </view>
            </view>
          </view>
        </block>
        <view class="empty-category" v-else>
          <image src="/static/images/empty.png" mode="aspectFit"></image>
          <text>暂无菜品，快去添加吧</text>
          <view class="add-dish-btn" @click="showAddDishPopup" v-if="canEdit">
            <text>添加菜品</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部购物车 -->
    <view class="cart-bar" v-if="cartTotal > 0">
      <view class="cart-info" @click="toggleCartPopup">
        <view class="cart-icon">
          <uni-icons type="cart" size="26" color="#fff"></uni-icons>
          <view class="cart-badge">{{ cartCount }}</view>
        </view>
        <view class="cart-price">
          <text>合计：</text>
          <text class="price">¥{{ cartTotal.toFixed(2) }}</text>
        </view>
      </view>
      <view class="submit-btn" @click="goToOrderConfirm">
        <text>去下单</text>
      </view>
    </view>

    <!-- 购物车弹出层 -->
    <view
      class="cart-popup-mask"
      v-if="showCartPopup"
      @click="toggleCartPopup"
    ></view>
    <view class="cart-popup" :class="{ 'cart-popup-show': showCartPopup }">
      <view class="cart-header">
        <text class="cart-title">购物车</text>
        <view class="cart-clear" @click="clearCart">
          <uni-icons type="trash" size="18" color="#999"></uni-icons>
          <text>清空</text>
        </view>
      </view>
      <scroll-view scroll-y="true" class="cart-list">
        <view class="cart-item" v-for="(item, index) in cart" :key="index">
          <image
            class="cart-item-image"
            :src="item.image"
            mode="aspectFill"
          ></image>
          <view class="cart-item-info">
            <view class="cart-item-name">{{ item.name }}</view>
            <view class="cart-item-price">¥{{ item.price.toFixed(2) }}</view>
          </view>
          <view class="cart-item-actions">
            <view
              class="cart-item-minus"
              @click="minusFromCartById(item.dish_id)"
            >
              <image
                src="/static/images/delete.png"
                class="action-icon"
              ></image>
            </view>
            <text class="cart-item-count">{{ item.count }}</text>
            <view class="cart-item-plus" @click="addToCartById(item.dish_id)">
              <image src="/static/images/add.png" class="action-icon"></image>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="cart-footer">
        <view class="cart-total">
          <text>合计：</text>
          <text class="price">¥{{ cartTotal.toFixed(2) }}</text>
        </view>
        <view class="cart-submit" @click="goToOrderConfirm">
          <text>去下单</text>
        </view>
      </view>
    </view>

    <!-- 悬浮添加按钮 (仅管理员可见) -->
    <view
      class="float-add-btn"
      @click="showAddDishPopup"
      v-if="canEdit && menuInfo.categories.length > 0"
    >
      <uni-icons type="plusempty" size="20" color="#fff"></uni-icons>
      <text>添加菜品</text>
    </view>

    <!-- 权限提示 -->
    <view class="permission-tip" v-if="showPermissionTip">
      {{ permissionTipText }}
    </view>

    <!-- 添加分类弹窗 - 自定义实现 -->
    <view
      class="custom-popup-mask"
      v-if="showCategoryPopup"
      @click="closeAddCategoryPopup"
    ></view>
    <view class="custom-popup" v-if="showCategoryPopup">
      <view class="popup-content admin-popup">
        <view class="popup-title">添加分类</view>

        <!-- 历史分类记录 -->
        <view class="history-section" v-if="historyCategoryList.length > 0">
          <view class="history-title">历史记录</view>
          <view class="history-list">
            <view
              class="history-item"
              v-for="(item, index) in historyCategoryList"
              :key="index"
              @click="quickAddCategory(item)"
            >
              <text>{{ item.name }}</text>
            </view>
          </view>
        </view>

        <view class="popup-form">
          <view class="form-item">
            <text class="form-label">分类名称</text>
            <input
              class="form-input"
              v-model="categoryForm.name"
              placeholder="请输入分类名称"
              maxlength="20"
            />
          </view>
        </view>
        <view class="popup-buttons">
          <button class="cancel-btn" @click="closeAddCategoryPopup">
            取消
          </button>
          <button class="confirm-btn" @click="addCategory">确定</button>
        </view>
      </view>
    </view>

    <!-- 添加菜品弹窗 - 自定义实现 -->
    <view
      class="custom-popup-mask"
      v-if="showDishPopup"
      @click="closeAddDishPopup"
    ></view>
    <view class="custom-popup" v-if="showDishPopup">
      <view class="popup-content dish-popup">
        <view class="popup-title">添加菜品</view>

        <!-- 历史菜品记录 -->
        <view class="history-section" v-if="historyDishList.length > 0">
          <view class="history-title">历史记录</view>
          <scroll-view scroll-x="true" class="history-dish-scroll">
            <view class="history-dish-list">
              <view
                class="history-dish-item"
                v-for="(item, index) in historyDishList"
                :key="index"
                @click="quickAddDish(item)"
              >
                <image
                  class="history-dish-image"
                  :src="item.image"
                  mode="aspectFill"
                ></image>
                <view class="history-dish-info">
                  <text class="history-dish-name">{{ item.name }}</text>
                  <text class="history-dish-price"
                    >¥{{ item.price.toFixed(2) }}</text
                  >
                </view>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="popup-form">
          <view class="form-item">
            <text class="form-label">菜品名称</text>
            <input
              class="form-input"
              v-model="dishForm.name"
              placeholder="请输入菜品名称"
              maxlength="30"
            />
          </view>
          <view class="form-item">
            <text class="form-label">菜品价格</text>
            <input
              class="form-input"
              v-model="dishForm.price"
              placeholder="请输入菜品价格"
              type="digit"
            />
          </view>
          <view class="form-item">
            <text class="form-label">菜品描述</text>
            <textarea
              class="form-textarea"
              v-model="dishForm.description"
              placeholder="请输入菜品描述（选填）"
              maxlength="100"
            ></textarea>
          </view>
          <view class="form-item">
            <text class="form-label">菜品图片</text>
            <view
              class="image-uploader"
              @click="chooseImage"
              v-if="!dishForm.imageUrl"
            >
              <uni-icons type="camera" size="30" color="#999"></uni-icons>
              <text class="upload-text">点击上传</text>
            </view>
            <image
              v-else
              class="uploaded-image"
              :src="dishForm.imageUrl"
              mode="aspectFill"
              @click="chooseImage"
            ></image>
          </view>
          <view class="form-item">
            <text class="form-label">所属分类</text>
            <picker
              :value="dishForm.categoryIndex"
              :range="categoryOptions"
              range-key="name"
              @change="onCategoryChange"
            >
              <view class="picker-view">
                <text>{{
                  getCategoryName(dishForm.category_id) || "请选择分类"
                }}</text>
                <uni-icons type="arrowdown" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>
        </view>
        <view class="popup-buttons">
          <button class="cancel-btn" @click="closeAddDishPopup">取消</button>
          <button class="confirm-btn" @click="addDish">确定</button>
        </view>
      </view>
    </view>

    <!-- 编辑菜单信息弹窗 -->
    <view
      class="custom-popup-mask"
      v-if="showEditMenuDialog"
      @click="closeEditMenuPopup"
    ></view>
    <view class="custom-popup" v-if="showEditMenuDialog">
      <view class="popup-content admin-popup">
        <view class="popup-title">编辑菜单信息</view>
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
          <button class="confirm-btn" @click="updateMenuInfo">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { onLoad, onShow, onShareAppMessage } from "@dcloudio/uni-app";

// 菜单ID
const menuId = ref("");
// 用户ID
const uid = ref("");
// 订单ID（如果是加菜模式）
const orderId = ref("");
// 模式：add-加菜模式
const mode = ref("");
// 菜单信息
const menuInfo = ref({
  name: "",
  participants_info: [],
  categories: [],
  dishes: [],
  creator_id: "",
  status: 0,
  create_time: Date.now(),
});
// 当前选中的分类ID
const currentCategory = ref("");
// 购物车
const cart = ref([]);
// 控制弹窗显示
const showOrderPopup = ref(false);
const showCategoryPopup = ref(false);
const showDishPopup = ref(false);
const showCartPopup = ref(false);
const showEditMenuDialog = ref(false);
// 分类表单
const categoryForm = ref({
  name: "",
});
// 菜品表单
const dishForm = ref({
  name: "",
  price: "",
  description: "",
  imageUrl: "",
  imagePath: "",
  category_id: "",
  categoryIndex: 0,
});
// 编辑菜单表单
const editMenuForm = ref({
  name: "",
  description: "",
});
// 用户信息
const userInfo = ref(null);
// 菜单状态（新增）
const menuOrderStatus = ref({
  isOrdered: false,
  orderId: "",
  orderUser: "",
});

// 分类选项列表
const categoryOptions = computed(() => {
  return menuInfo.value.categories.map((item) => ({
    id: item.category_id,
    name: item.name,
  }));
});

// 根据分类ID获取分类名称
const getCategoryName = (categoryId) => {
  if (!categoryId) return "";
  const category = menuInfo.value.categories.find(
    (item) => item.category_id === categoryId
  );
  return category ? category.name : "";
};

// 分类选择器改变事件
const onCategoryChange = (e) => {
  const index = e.detail.value;
  dishForm.value.categoryIndex = index;
  dishForm.value.category_id = categoryOptions.value[index].id;
};

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"], // 优先使用压缩图片，减少上传失败概率
    sourceType: ["album", "camera"],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      // 获取文件信息，检查文件大小和类型
      uni.getFileInfo({
        filePath: tempFilePath,
        success: (fileInfo) => {
          console.log("选择的图片信息:", {
            大小: fileInfo.size,
            格式: tempFilePath.split(".").pop().toLowerCase(),
          });

          // 检查文件大小，限制在2MB以内
          if (fileInfo.size > 2 * 1024 * 1024) {
            uni.showToast({
              title: "图片过大，请选择2MB以内的图片",
              icon: "none",
            });
            return;
          }

          // 设置图片路径
          dishForm.value.imageUrl = tempFilePath;
          dishForm.value.imagePath = tempFilePath;
        },
        fail: (err) => {
          console.error("获取文件信息失败:", err);
          // 即使获取文件信息失败，也尝试设置图片路径
          dishForm.value.imageUrl = tempFilePath;
          dishForm.value.imagePath = tempFilePath;
        },
      });
    },
    fail: (err) => {
      console.error("选择图片失败:", err);
      uni.showToast({
        title: "选择图片失败",
        icon: "none",
      });
    },
  });
};

// 是否可以编辑
const canEdit = computed(() => {
  // 确保获取正确的用户ID和菜单创建者ID
  let currentUserId = "";
  let creatorId = "";

  // 尝试多种方式获取当前用户ID
  if (userInfo.value && userInfo.value._id) {
    currentUserId = String(userInfo.value._id);
  } else if (uid.value) {
    currentUserId = String(uid.value);
  } else {
    // 尝试从本地存储获取
    const storedUid = uni.getStorageSync("uid");
    if (storedUid) {
      currentUserId = String(storedUid);
    }
  }

  // 尝试多种方式获取创建者ID
  if (menuInfo.value && menuInfo.value.creator_id) {
    creatorId = String(menuInfo.value.creator_id);
  }

  // 判断菜单状态
  const isActiveMenu =
    menuInfo.value.status === 0 ||
    menuInfo.value.status === "0" ||
    menuInfo.value.status === null ||
    menuInfo.value.status === undefined;

  // 详细记录权限检查过程
  console.log("编辑权限详细检查:", {
    creatorId: creatorId,
    currentUserId: currentUserId,
    userInfoId: userInfo.value ? userInfo.value._id : null,
    uidValue: uid.value,
    storedUid: uni.getStorageSync("uid"),
    menuStatus: menuInfo.value.status,
    menuStatusType: typeof menuInfo.value.status,
    isCreator: creatorId === currentUserId,
    isActiveMenu: isActiveMenu,
    环境: process.env.NODE_ENV === "production" ? "生产环境" : "开发环境",
  });

  // 确保两个ID都不为空再进行比较
  if (!creatorId || !currentUserId) {
    console.log("创建者ID或当前用户ID为空，无法确定编辑权限");
    return false;
  }

  // 返回最终判断结果
  const hasPermission = creatorId === currentUserId && isActiveMenu;
  console.log(`编辑权限判断结果: ${hasPermission ? "有权限" : "无权限"}`);
  return hasPermission;
});

// 当前分类的菜品
const currentCategoryDishes = computed(() => {
  if (currentCategory.value === "all") {
    return menuInfo.value.dishes;
  }
  return menuInfo.value.dishes.filter(
    (dish) => dish.category_id === currentCategory.value
  );
});

// 显示的参与者头像（最多5个）
const visibleParticipants = computed(() => {
  return menuInfo.value.participants
    ? menuInfo.value.participants
        .map((p) => ({
          ...p,
          avatar: p.avatar || p.avatarUrl,
          nickname: p.nickname || p.nickName,
        }))
        .slice(0, 5)
    : [];
});

// 参与人数
const participantsCount = ref(0);

// 权限提示
const showPermissionTip = ref(false);
const permissionTipText = ref("");

// 购物车总数
const cartCount = computed(() => {
  return cart.value.reduce((total, item) => total + item.count, 0);
});

// 购物车总价
const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => total + item.price * item.count, 0);
});

// 获取购物车中某菜品的数量
const getCartCount = (dishId) => {
  const item = cart.value.find((item) => item.dish_id === dishId);
  return item ? item.count : 0;
};

// 判断是否可以继续点菜（菜单创建时间在两小时以内）
const canOrderDishes = computed(() => {
  if (!menuInfo.value.create_time) return true; // 如果没有创建时间，默认允许
  const twoHours = 2 * 60 * 60 * 1000; // 两小时的毫秒数
  return Date.now() - menuInfo.value.create_time < twoHours;
});

// 历史分类记录
const historyCategoryList = ref([]);
// 历史菜品记录
const historyDishList = ref([]);

// 页面加载
onLoad(async (options) => {
  if (options.id) {
    menuId.value = options.id;
  }

  // 如果是加菜模式
  if (options.mode === "add") {
    mode.value = "add";
    if (options.order_id) {
      orderId.value = options.order_id;
    }
  }

  // 保存用户ID供模板使用
  uid.value = uni.getStorageSync("uid");

  await getUserInfo();
  loadHistoryData();

  // 自动参与菜单：如果不是创建者，自动调用joinMenu
  if (userInfo.value && menuId.value) {
    // 先获取菜单详情，判断是否为参与者
    const token = uni.getStorageSync("token");
    const userId = userInfo.value._id;
    try {
      const res = await uniCloud.callFunction({
        name: "menu",
        data: {
          action: "getMenuDetail",
          menu_id: String(menuId.value),
          token,
          uid: userId,
        },
      });
      if (res.result.code !== 0) {
        // 不是参与者，自动加入
        joinMenu();
      } else {
        // 已是参与者，正常加载菜单
        getMenuDetail();
      }
    } catch (e) {
      // 网络异常等，尝试加入
      joinMenu();
    }
  }
});

// 加载历史数据
const loadHistoryData = () => {
  try {
    // 尝试从本地存储加载历史分类和菜品数据
    const historyCategories = uni.getStorageSync("historyCategoryList");
    if (historyCategories) {
      historyCategoryList.value = JSON.parse(historyCategories);
    }

    const historyDishes = uni.getStorageSync("historyDishList");
    if (historyDishes) {
      historyDishList.value = JSON.parse(historyDishes);
    }
  } catch (e) {
    console.error("加载历史数据失败", e);
  }
};

// 保存历史分类记录
const saveHistoryCategoryList = () => {
  try {
    uni.setStorageSync(
      "historyCategoryList",
      JSON.stringify(historyCategoryList.value)
    );
  } catch (e) {
    console.error("保存历史分类记录失败", e);
  }
};

// 保存历史菜品记录
const saveHistoryDishList = () => {
  try {
    uni.setStorageSync(
      "historyDishList",
      JSON.stringify(historyDishList.value)
    );
  } catch (e) {
    console.error("保存历史菜品记录失败", e);
  }
};

// 快速添加分类
const quickAddCategory = (category) => {
  categoryForm.value.name = category.name;
};

// 快速添加菜品
const quickAddDish = async (dish) => {
  // 修改表单数据，但不包括图片，因为历史记录中的图片可能已经失效
  dishForm.value.name = dish.name;
  dishForm.value.price = dish.price;
  dishForm.value.description = dish.description || "";

  // 选择分类
  if (dish.category_id) {
    const categoryIndex = menuInfo.value.categories.findIndex(
      (item) => item.category_id === dish.category_id
    );
    if (categoryIndex !== -1) {
      dishForm.value.categoryIndex = categoryIndex;
      dishForm.value.category_id = dish.category_id;
    }
  }

  // 用户仍然需要手动上传图片
  uni.showToast({
    title: "请上传菜品图片",
    icon: "none",
  });
};

// 获取用户信息
const getUserInfo = async () => {
  return new Promise((resolve) => {
    try {
      const userStr = uni.getStorageSync("userInfo");
      if (userStr) {
        if (typeof userStr === "string") {
          userInfo.value = JSON.parse(userStr);
        } else if (typeof userStr === "object") {
          userInfo.value = userStr;
        }
        // 统一字段
        userInfo.value.avatar =
          userInfo.value.avatar || userInfo.value.avatarUrl;
        userInfo.value.nickname =
          userInfo.value.nickname || userInfo.value.nickName;
        resolve(userInfo.value);
      } else {
        navToLogin();
        resolve(null);
      }
    } catch (err) {
      resolve(null);
    }
  });
};

// 跳转到登录页
const navToLogin = () => {
  uni.navigateTo({
    url: "/pages/login/login",
  });
};

// 关闭弹窗
const closePopup = () => {
  showOrderPopup.value = false;
  // 清空购物车
  cart.value = [];
};

// 加菜
const addMore = () => {
  showOrderPopup.value = false;
  // 清空购物车
  cart.value = [];
};

// 显示添加分类弹窗
const showAddCategoryPopup = () => {
  if (!canEdit.value) {
    permissionTipText.value = "仅菜单创建者可以添加分类";
    showPermissionTip.value = true;
    setTimeout(() => {
      showPermissionTip.value = false;
    }, 2000);
    return;
  }

  // 重置表单
  categoryForm.value = {
    name: "",
  };

  // 打开弹窗
  showCategoryPopup.value = true;
};

// 关闭添加分类弹窗
const closeAddCategoryPopup = () => {
  showCategoryPopup.value = false;
};

// 添加分类
const addCategory = async () => {
  // 表单验证
  if (!categoryForm.value.name.trim()) {
    uni.showToast({
      title: "请输入分类名称",
      icon: "none",
    });
    return;
  }

  // 显示加载中
  uni.showLoading({
    title: "添加中...",
    mask: true,
  });

  try {
    // 获取token
    const token = uni.getStorageSync("token");

    const res = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "addCategory",
        menu_id: menuId.value,
        name: categoryForm.value.name,
        token: token,
        uid: userInfo.value._id,
      },
    });

    if (res.result.code === 0) {
      // 添加到历史记录
      const newCategory = {
        name: categoryForm.value.name,
      };

      // 检查是否已存在相同名称的分类
      const existIndex = historyCategoryList.value.findIndex(
        (item) => item.name === newCategory.name
      );
      if (existIndex !== -1) {
        // 如果存在，则移除旧的记录
        historyCategoryList.value.splice(existIndex, 1);
      }

      // 添加到历史记录的开头
      historyCategoryList.value.unshift(newCategory);

      // 限制历史记录最多保存10条
      if (historyCategoryList.value.length > 10) {
        historyCategoryList.value = historyCategoryList.value.slice(0, 10);
      }

      // 保存历史记录
      saveHistoryCategoryList();

      // 关闭弹窗
      closeAddCategoryPopup();

      // 刷新菜单信息
      getMenuDetail();

      // 提示添加成功
      uni.showToast({
        title: "添加成功",
        icon: "success",
      });

      // 自动切换到新添加的分类
      if (res.result.data && res.result.data.category_id) {
        currentCategory.value = res.result.data.category_id;
      }
    } else {
      throw new Error(res.result.msg || "添加分类失败");
    }
  } catch (e) {
    console.error(e);
    uni.showToast({
      title: "添加分类失败: " + e.message,
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 显示添加菜品弹窗
const showAddDishPopup = () => {
  if (!canEdit.value) {
    permissionTipText.value = "仅菜单创建者可以添加菜品";
    showPermissionTip.value = true;
    setTimeout(() => {
      showPermissionTip.value = false;
    }, 2000);
    return;
  }

  // 检查是否有分类可选
  if (menuInfo.value.categories.length === 0) {
    uni.showToast({
      title: "请先添加分类",
      icon: "none",
    });
    return;
  }

  // 重置表单
  dishForm.value = {
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    imagePath: "",
    category_id: currentCategory.value !== "all" ? currentCategory.value : "",
    categoryIndex: 0,
  };

  // 如果当前分类不是"all"并且存在于分类列表中，则默认选择当前分类
  if (currentCategory.value !== "all") {
    const currentIndex = menuInfo.value.categories.findIndex(
      (item) => item.category_id === currentCategory.value
    );
    if (currentIndex !== -1) {
      dishForm.value.categoryIndex = currentIndex;
      dishForm.value.category_id = currentCategory.value;
    }
  }

  // 打开弹窗
  showDishPopup.value = true;
};

// 关闭添加菜品弹窗
const closeAddDishPopup = () => {
  showDishPopup.value = false;
};

// 添加菜品
const addDish = async () => {
  // 表单验证
  if (!dishForm.value.name.trim()) {
    uni.showToast({
      title: "请输入菜品名称",
      icon: "none",
    });
    return;
  }

  if (!dishForm.value.price) {
    uni.showToast({
      title: "请输入菜品价格",
      icon: "none",
    });
    return;
  }

  if (!dishForm.value.imagePath) {
    uni.showToast({
      title: "请上传菜品图片",
      icon: "none",
    });
    return;
  }

  // 处理分类 - 如果选择了"全部"或没有选择分类
  let categoryId = dishForm.value.category_id;

  // 如果没有选择分类或选择了"全部"，则使用第一个实际分类
  if (!categoryId && menuInfo.value.categories.length > 0) {
    categoryId = menuInfo.value.categories[0].category_id;
    console.log("自动选择第一个分类:", categoryId);
  }

  // 确保有分类ID
  if (!categoryId) {
    uni.showToast({
      title: "请先添加一个分类",
      icon: "none",
    });
    return;
  }

  // 显示加载中
  uni.showLoading({
    title: "添加中...",
    mask: true,
  });

  try {
    // 获取token
    const token = uni.getStorageSync("token");
    const uid = userInfo.value._id;

    // 确保menuId是字符串类型
    const safeMenuId = String(menuId.value || "");
    // 确保categoryId是字符串类型
    const safeCategoryId = String(categoryId || "");

    console.log("准备添加菜品，参数检查:", {
      菜品名称: dishForm.value.name,
      菜品价格: dishForm.value.price,
      价格类型: typeof dishForm.value.price,
      菜单ID: safeMenuId,
      分类ID: safeCategoryId,
      token存在: !!token,
      uid存在: !!uid,
      图片路径存在: !!dishForm.value.imagePath,
      环境: process.env.NODE_ENV === "production" ? "生产环境" : "开发环境",
    });

    // 预处理价格，确保是数字
    let priceValue;
    try {
      priceValue = parseFloat(dishForm.value.price);
      if (isNaN(priceValue)) {
        throw new Error("价格转换为数字失败");
      }
      console.log("价格解析结果:", priceValue);
    } catch (priceError) {
      console.error("价格处理错误:", priceError);
      uni.hideLoading();
      uni.showToast({
        title: "价格格式错误，请输入有效数字",
        icon: "none",
      });
      return;
    }

    // 先上传图片
    console.log("开始上传图片...");
    let uploadRes;
    try {
      // 构建更安全的文件路径，避免特殊字符
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const safeFileName = `dish_${timestamp}_${randomStr}.jpg`;

      uploadRes = await uniCloud.uploadFile({
        filePath: dishForm.value.imagePath,
        cloudPath: `dish_images/${safeFileName}`,
      });
      console.log("图片上传成功:", uploadRes);

      if (!uploadRes || !uploadRes.fileID) {
        throw new Error("未获取到有效的文件ID");
      }
    } catch (uploadError) {
      console.error("图片上传失败:", uploadError);
      uni.hideLoading();
      uni.showToast({
        title: "图片上传失败: " + (uploadError.message || "请重试"),
        icon: "none",
      });
      return;
    }

    // 构建请求参数
    const requestData = {
      action: "addDish",
      menu_id: safeMenuId,
      category_id: safeCategoryId,
      name: dishForm.value.name.trim(),
      price: priceValue,
      description: (dishForm.value.description || "").trim(),
      image: uploadRes.fileID,
      token: token,
      uid: uid,
    };

    console.log("准备调用云函数，请求数据:", JSON.stringify(requestData));

    // 添加菜品
    try {
      const res = await uniCloud.callFunction({
        name: "menu",
        data: requestData,
      });

      console.log("云函数返回结果:", JSON.stringify(res.result));

      if (res.result && res.result.code === 0) {
        // 添加到历史记录
        const newDish = {
          name: dishForm.value.name,
          price: priceValue,
          description: dishForm.value.description || "",
          image: uploadRes.fileID,
          category_id: safeCategoryId,
        };

        // 检查是否已存在相同名称的菜品
        const existIndex = historyDishList.value.findIndex(
          (item) => item.name === newDish.name
        );
        if (existIndex !== -1) {
          // 如果存在，则移除旧的记录
          historyDishList.value.splice(existIndex, 1);
        }

        // 添加到历史记录的开头
        historyDishList.value.unshift(newDish);

        // 限制历史记录最多保存20条
        if (historyDishList.value.length > 20) {
          historyDishList.value = historyDishList.value.slice(0, 20);
        }

        // 保存历史记录
        saveHistoryDishList();

        // 关闭弹窗
        closeAddDishPopup();

        // 刷新菜单信息
        getMenuDetail();

        // 确保切换到对应分类
        currentCategory.value = categoryId;

        // 提示添加成功
        uni.showToast({
          title: "添加成功",
          icon: "success",
        });
      } else {
        console.error("添加菜品API返回错误:", res.result);

        // 尝试备用方法
        const backupResult = await tryBackupAddDish({
          menuId: safeMenuId,
          categoryId: safeCategoryId,
          name: dishForm.value.name.trim(),
          price: priceValue,
          description: (dishForm.value.description || "").trim(),
          imageFileID: uploadRes.fileID,
          token,
          uid,
        });

        if (backupResult.success) {
          // 备用方法成功
          console.log("备用方法添加菜品成功");

          // 关闭弹窗
          closeAddDishPopup();

          // 刷新菜单信息
          getMenuDetail();

          // 提示添加成功
          uni.showToast({
            title: "添加成功",
            icon: "success",
          });

          return;
        }

        throw new Error(res.result.msg || res.result.message || "添加菜品失败");
      }
    } catch (apiError) {
      console.error("调用云函数失败:", apiError);
      throw apiError;
    }
  } catch (e) {
    console.error("添加菜品过程中出错:", e);
    console.error("错误详情:", e.stack); // 打印完整的错误堆栈
    uni.showToast({
      title: "添加失败: " + (e.message || "请重试"),
      icon: "none",
      duration: 3000,
    });
  } finally {
    uni.hideLoading();
  }
};

// 备用添加菜品方法
const tryBackupAddDish = async (params) => {
  try {
    console.log("尝试使用备用方法添加菜品");

    // 尝试不同的参数格式
    const alternativeParams = {
      action: "addDish",
      menuId: params.menuId, // 尝试使用menuId而不是menu_id
      categoryId: params.categoryId, // 尝试使用categoryId而不是category_id
      name: params.name,
      price: params.price,
      description: params.description,
      image: params.imageFileID,
      token: params.token,
      uid: params.uid,
    };

    console.log("备用方法请求参数:", JSON.stringify(alternativeParams));

    const res = await uniCloud.callFunction({
      name: "menu",
      data: alternativeParams,
    });

    console.log("备用方法返回结果:", JSON.stringify(res.result));

    if (res.result && res.result.code === 0) {
      return { success: true, data: res.result.data };
    }

    // 如果第一种备用方法失败，尝试第二种
    const alternativeParams2 = {
      action: "addDish",
      menu_id: params.menuId,
      category_id: params.categoryId,
      dishData: {
        name: params.name,
        price: params.price,
        description: params.description,
        image: params.imageFileID,
      },
      token: params.token,
      uid: params.uid,
    };

    console.log("备用方法2请求参数:", JSON.stringify(alternativeParams2));

    const res2 = await uniCloud.callFunction({
      name: "menu",
      data: alternativeParams2,
    });

    console.log("备用方法2返回结果:", JSON.stringify(res2.result));

    if (res2.result && res2.result.code === 0) {
      return { success: true, data: res2.result.data };
    }

    return { success: false, error: "所有备用方法都失败" };
  } catch (e) {
    console.error("备用方法出错:", e);
    return { success: false, error: e.message };
  }
};

// 邀请朋友加入菜单
const inviteFriends = () => {
  uni.showToast({
    title: "点击右上角分享",
    icon: "none",
    duration: 2000,
  });
};

// 定义分享信息（微信小程序的生命周期函数）
onShareAppMessage(() => {
  // 返回分享信息配置
  return {
    title: `${menuInfo.value.name || "美食菜单"} - 快来一起点餐吧`,
    path: `/pages/menu/menu?id=${menuId.value}`,
    imageUrl:
      menuInfo.value.dishes && menuInfo.value.dishes.length > 0
        ? menuInfo.value.dishes[0].image
        : "",
  };
});

// 切换购物车弹出层
const toggleCartPopup = () => {
  showCartPopup.value = !showCartPopup.value;
};

// 清空购物车
const clearCart = () => {
  if (menuOrderStatus.value.isOrdered) {
    uni.showToast({
      title: "已有好友下单，无法修改购物车",
      icon: "none",
    });
    return;
  }
  cart.value = [];
  showCartPopup.value = false;
  syncCartToCloud();
};

// 从购物车减少
const minusFromCart = (dish) => {
  if (menuOrderStatus.value.isOrdered) {
    uni.showToast({
      title: "已有好友下单，无法修改购物车",
      icon: "none",
    });
    return;
  }
  if (!canOrderDishes.value) {
    uni.showToast({
      title: "菜单已超过2小时，无法点菜",
      icon: "none",
    });
    return;
  }
  if (menuInfo.value.status !== 0 && mode.value !== "add") {
    uni.showToast({
      title: "菜单已提交，无法修改",
      icon: "none",
    });
    return;
  }
  const index = cart.value.findIndex((item) => item.dish_id === dish.dish_id);
  if (index > -1) {
    if (cart.value[index].count > 1) {
      cart.value[index].count -= 1;
    } else {
      cart.value.splice(index, 1);
    }
    syncCartToCloud();
  }
};

// 添加到购物车
const addToCart = (dish) => {
  if (menuOrderStatus.value.isOrdered) {
    uni.showToast({
      title: "已有好友下单，无法修改购物车",
      icon: "none",
    });
    return;
  }
  // 检查菜单是否已超过2小时
  if (!canOrderDishes.value) {
    uni.showToast({
      title: "菜单已超过2小时，无法点菜",
      icon: "none",
    });
    return;
  }
  if (menuInfo.value.status !== 0 && mode.value !== "add") {
    uni.showToast({
      title: "菜单已提交，无法修改",
      icon: "none",
    });
    return;
  }
  const index = cart.value.findIndex((item) => item.dish_id === dish.dish_id);
  if (index > -1) {
    cart.value[index].count += 1;
  } else {
    cart.value.push({
      dish_id: dish.dish_id,
      name: dish.name,
      image: dish.image,
      price: dish.price,
      count: 1,
      user_id: userInfo.value._id,
      nickname: userInfo.value.nickname,
    });
  }
  syncCartToCloud();
};

// 从购物车减少（通过ID）
const minusFromCartById = (dishId) => {
  if (menuOrderStatus.value.isOrdered) {
    uni.showToast({
      title: "已有好友下单，无法修改购物车",
      icon: "none",
    });
    return;
  }
  if (menuInfo.value.status !== 0 && mode.value !== "add") {
    uni.showToast({
      title: "菜单已提交，无法修改",
      icon: "none",
    });
    return;
  }
  const index = cart.value.findIndex((item) => item.dish_id === dishId);
  if (index > -1) {
    if (cart.value[index].count > 1) {
      cart.value[index].count -= 1;
    } else {
      cart.value.splice(index, 1);
    }
    syncCartToCloud();
  }
};

// 添加到购物车（通过ID）
const addToCartById = (dishId) => {
  if (menuOrderStatus.value.isOrdered) {
    uni.showToast({
      title: "已有好友下单，无法修改购物车",
      icon: "none",
    });
    return;
  }
  if (menuInfo.value.status !== 0 && mode.value !== "add") {
    uni.showToast({
      title: "菜单已提交，无法修改",
      icon: "none",
    });
    return;
  }
  const index = cart.value.findIndex((item) => item.dish_id === dishId);
  if (index > -1) {
    cart.value[index].count += 1;
  } else {
    const dish = menuInfo.value.dishes.find((item) => item.dish_id === dishId);
    if (!dish) return;
    cart.value.push({
      dish_id: dishId,
      name: dish.name,
      image: dish.image,
      price: dish.price,
      count: 1,
      user_id: userInfo.value._id,
      nickname: userInfo.value.nickname,
    });
  }
  syncCartToCloud();
};

// 去下单
const goToOrderConfirm = () => {
  if (cart.value.length === 0) {
    uni.showToast({
      title: "购物车为空",
      icon: "none",
    });
    return;
  }

  // 如果是加菜模式
  if (mode.value === "add") {
    submitAddOrder();
    return;
  }

  const orderInfo = {
    menu_id: menuId.value,
    menu_name: menuInfo.value.name,
    cart: JSON.stringify(cart.value),
    total: cartTotal.value,
  };

  uni.navigateTo({
    url:
      "/pages/order/detail?orderInfo=" +
      encodeURIComponent(JSON.stringify(orderInfo)),
  });
};

// 参与菜单
const joinMenu = () => {
  if (!userInfo.value || !userInfo.value._id) {
    uni.showToast({
      title: "请先登录",
      icon: "none",
    });
    return;
  }

  // 获取token和uid
  const token = uni.getStorageSync("token");
  const uid = userInfo.value._id;

  uniCloud
    .callFunction({
      name: "menu",
      data: {
        action: "joinMenu",
        menu_id: menuId.value,
        token,
        uid,
      },
    })
    .then((res) => {
      const { code, message } = res.result;
      if (code === 0) {
        // 刷新菜单详情，获取最新的参与者列表
        getMenuDetail();
      } else {
        console.error(message);
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

// 更新菜单状态为已完成
const updateMenuStatus = () => {
  const token = uni.getStorageSync("token");
  const uid = uni.getStorageSync("uid");

  uniCloud
    .callFunction({
      name: "menu",
      data: {
        action: "updateMenuStatus",
        menu_id: menuId.value, // 将 menuId 改为 menu_id，与后端保持一致
        status: "completed",
        token,
        uid,
      },
    })
    .then((res) => {
      const { code } = res.result;
      if (code === 0) {
        console.log("菜单状态已更新为已完成");
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

// 加菜模式下的提交订单
const submitAddOrder = async () => {
  if (cart.value.length === 0) {
    uni.showToast({
      title: "请先添加菜品",
      icon: "none",
    });
    return;
  }

  // 显示加载中
  uni.showLoading({
    title: "提交中...",
    mask: true,
  });

  try {
    // 获取token
    const token = uni.getStorageSync("token");

    // 调用云函数添加菜品
    const res = await uniCloud.callFunction({
      name: "order",
      data: {
        action: "addMoreDishes",
        order_id: orderId.value,
        menu_id: menuId.value,
        dishes: cart.value,
        token: token,
        uid: userInfo.value._id,
      },
    });

    if (res.result.code === 0) {
      // 清空购物车
      cart.value = [];

      // 提示成功
      uni.showToast({
        title: "加菜成功",
        icon: "success",
      });

      // 返回订单页面
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      throw new Error(res.result.message || "加菜失败");
    }
  } catch (e) {
    console.error(e);
    uni.showToast({
      title: "加菜失败: " + e.message,
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 切换分类
const switchCategory = (categoryId) => {
  currentCategory.value = categoryId;
};

// 检测当前环境
const detectEnvironment = () => {
  let env = "未知环境";

  try {
    // 检测是否为体验版
    if (typeof wx !== "undefined" && wx.getAccountInfoSync) {
      try {
        const accountInfo = wx.getAccountInfoSync();
        if (accountInfo && accountInfo.miniProgram) {
          const { envVersion } = accountInfo.miniProgram;
          if (envVersion === "release") {
            env = "正式版";
          } else if (envVersion === "trial") {
            env = "体验版";
          } else if (envVersion === "develop") {
            env = "开发版";
          }
        }
      } catch (wxError) {
        console.error("获取小程序环境信息失败:", wxError);
      }
    }

    // 检测Node环境
    if (process.env.NODE_ENV) {
      env += ` (${process.env.NODE_ENV})`;
    }

    console.log(`当前运行环境: ${env}`);
    return env;
  } catch (e) {
    console.error("环境检测出错:", e);
    return env;
  }
};

// 页面挂载
onMounted(() => {
  // 检测环境
  const currentEnv = detectEnvironment();
  console.log(`应用运行在: ${currentEnv}`);

  // 根据环境调整行为
  if (currentEnv.includes("体验版")) {
    console.log("在体验版环境中运行，启用额外的兼容性处理");
    // 可以在这里设置一些体验版特定的行为
  }

  fetchCartFromCloud(); // 初始获取共享购物车
  startCartPolling();
});

onUnmounted(() => {
  if (cartSyncTimer) clearInterval(cartSyncTimer);
  if (orderPollingTimer) clearInterval(orderPollingTimer);
});

// 获取菜单详情
const getMenuDetail = async () => {
  if (!menuId.value) return;

  uni.showLoading({
    title: "加载中...",
    mask: true,
  });

  try {
    // 确保先获取用户信息
    await getUserInfo();

    // 获取token
    const token = uni.getStorageSync("token");

    // 检测环境
    const currentEnv = detectEnvironment();

    // 确保从userInfo中获取用户ID
    let userId = "";
    if (userInfo.value && userInfo.value._id) {
      userId = userInfo.value._id;
      uid.value = userId;
    } else {
      const storedUserId = uni.getStorageSync("uid");
      if (storedUserId) {
        userId = storedUserId;
        uid.value = storedUserId;
      } else {
        navToLogin();
        return;
      }
    }

    const requestData = {
      action: "getMenuDetail",
      menu_id: String(menuId.value),
      token: token,
      uid: userId,
      _env: currentEnv,
    };

    const res = await uniCloud.callFunction({
      name: "menu",
      data: requestData,
    });

    if (res.result.code === 0) {
      menuInfo.value = res.result.data;

      console.log("获取的菜单信息:", {
        menuId: menuId.value,
        menuName: menuInfo.value.name,
        creatorId: menuInfo.value.creator_id,
        status: menuInfo.value.status,
        userId: userId,
      });

      // 设置默认选中的分类
      if (menuInfo.value.categories.length > 0 && !currentCategory.value) {
        currentCategory.value = menuInfo.value.categories[0].category_id;
      } else if (!currentCategory.value) {
        currentCategory.value = "all";
      }

      // 明确判断当前用户是否有编辑权限（是否是创建者）
      let creatorId = String(menuInfo.value.creator_id || "");
      let currentUserId = String(userId || "");

      console.log("用户权限详细信息:", {
        creatorId: creatorId,
        currentUserId: currentUserId,
        creatorIdType: typeof menuInfo.value.creator_id,
        currentUserIdType: typeof userId,
        isEqual: creatorId === currentUserId,
      });

      if (creatorId === currentUserId) {
        console.log("当前用户是菜单创建者，有编辑权限");
        // 直接设置编辑权限
        if (menuInfo.value.status === 0 || menuInfo.value.status === "0") {
          console.log("菜单状态为0，允许编辑");
          // 强制更新uid和creator_id的值确保模板中比较成功
          setTimeout(() => {
            uid.value = currentUserId;
            // 确保菜单信息中的创建者ID与当前用户ID格式一致
            menuInfo.value.creator_id = currentUserId;
          }, 100);
        } else {
          console.log(
            "菜单状态不为0，不允许编辑，当前状态:",
            menuInfo.value.status
          );
        }
      } else {
        console.log("当前用户不是菜单创建者，无编辑权限");
        console.log("创建者ID:", creatorId);
        console.log("当前用户ID:", currentUserId);
      }

      // 更新参与人数
      participantsCount.value = menuInfo.value.participants
        ? menuInfo.value.participants.length
        : 0;
      // 新增：如果不是菜单创建者且没有菜品，弹出提示
      const isCreator =
        String(menuInfo.value.creator_id) ===
        String(userInfo.value && userInfo.value._id);
      if (
        !isCreator &&
        (!menuInfo.value.dishes || menuInfo.value.dishes.length === 0)
      ) {
        uni.showToast({
          title: "暂无菜品或无权限查看，请联系菜单创建者",
          icon: "none",
          duration: 3000,
        });
      }
    } else {
      // 不再自动joinMenu，交由onLoad处理
      uni.showToast({
        title: res.result.msg || "获取菜单详情失败",
        icon: "none",
      });
    }
  } catch (e) {
    uni.showToast({
      title: "获取菜单详情失败",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 页面显示
onShow(() => {
  getMenuDetail();

  // 页面显示时再次检查编辑权限
  setTimeout(() => {
    const userId = uni.getStorageSync("uid");
    const creatorId = menuInfo.value.creator_id;

    console.log("页面显示时检查编辑权限:", {
      uid: uid.value,
      userId: userId,
      creatorId: creatorId,
      equal: String(userId) === String(creatorId),
    });

    // 确保uid的值是最新的
    uid.value = userId;
  }, 300);
});

// 综合删除函数封装 - 先尝试普通删除，再尝试备用方法，最后本地删除
const safeDeleteItem = async ({ type, id, name, getCallback }) => {
  uni.showLoading({
    title: "删除中...",
    mask: true,
  });

  console.log(`开始安全删除${type}，id: ${id}, 名称: ${name}`);

  try {
    // 1. 尝试主方法删除
    if (type === "category") {
      await deleteCategory(id);
    } else {
      await deleteDish(id);
    }

    console.log(`使用主方法成功删除${type}: ${id}`);

    uni.showToast({
      title: `删除${name}成功`,
      icon: "success",
    });

    return true;
  } catch (primaryError) {
    console.error(`主方法删除${type}失败，尝试备用方法:`, primaryError);
    uni.hideLoading();

    try {
      // 2. 尝试备用方法删除
      if (type === "category") {
        await deleteCategoryFallback(id);
      } else {
        await deleteDishFallback(id);
      }

      console.log(`使用备用方法成功删除${type}: ${id}`);

      uni.showToast({
        title: `删除${name}成功`,
        icon: "success",
      });

      return true;
    } catch (fallbackError) {
      console.error(`备用方法删除${type}失败，尝试本地删除:`, fallbackError);

      try {
        // 3. 尝试本地删除
        let success = false;

        if (type === "category") {
          success = await deleteCategoryManually(id);
        } else {
          success = await deleteDishManually(id);
        }

        if (success) {
          console.log(`使用本地方法成功删除${type}: ${id}`);
          return true;
        } else {
          // 所有方法都失败，提示用户
          console.error(`所有删除${type}方法都失败: ${id}`);
          uni.showToast({
            title: `删除${type === "category" ? "分类" : "菜品"}失败`,
            icon: "none",
            duration: 2000,
          });

          // 尝试重新获取菜单数据
          if (typeof getCallback === "function") {
            getCallback();
          }

          return false;
        }
      } catch (manualError) {
        console.error(`本地删除${type}出现异常:`, manualError);
        uni.showToast({
          title: `删除${type === "category" ? "分类" : "菜品"}失败`,
          icon: "none",
          duration: 2000,
        });

        // 尝试重新获取菜单数据
        if (typeof getCallback === "function") {
          getCallback();
        }

        return false;
      }
    }
  } finally {
    uni.hideLoading();
  }
};

// 简化的处理分类长按删除事件
const handleCategoryLongPress = (categoryId, categoryName) => {
  if (categoryId === "all") {
    uni.showToast({
      title: "不能删除'全部'分类",
      icon: "none",
    });
    return;
  }

  uni.showModal({
    title: "删除分类",
    content: `确定要删除分类"${categoryName}"吗？该分类下的所有菜品都会被移除分类。`,
    confirmColor: "#fa9153",
    success: async (res) => {
      if (res.confirm) {
        await safeDeleteItem({
          type: "category",
          id: categoryId,
          name: categoryName,
          getCallback: getMenuDetail,
        });
      }
    },
  });
};

// 简化的处理菜品长按删除事件
const handleDishLongPress = (dishId, dishName) => {
  uni.showModal({
    title: "删除菜品",
    content: `确定要删除菜品"${dishName}"吗？`,
    confirmColor: "#fa9153",
    success: async (res) => {
      if (res.confirm) {
        await safeDeleteItem({
          type: "dish",
          id: dishId,
          name: dishName,
          getCallback: getMenuDetail,
        });
      }
    },
  });
};

// 手动删除分类（最终备用方案）
const deleteCategoryManually = async (categoryId) => {
  try {
    // 获取要删除的分类信息
    const category = menuInfo.value.categories.find(
      (c) => c.category_id === categoryId
    );
    const categoryName = category ? category.name : "分类";

    // 从本地分类列表中删除该分类
    menuInfo.value.categories = menuInfo.value.categories.filter(
      (c) => c.category_id !== categoryId
    );

    // 将该分类下的菜品移到"全部"分类下
    menuInfo.value.dishes = menuInfo.value.dishes.map((dish) => {
      if (dish.category_id === categoryId) {
        return { ...dish, category_id: "" };
      }
      return dish;
    });

    // 切换到全部分类
    currentCategory.value = "all";

    // 显示成功消息
    uni.showToast({
      title: `删除${categoryName}成功`,
      icon: "success",
    });

    // 尝试异步保存变更到服务器（不等待结果）
    try {
      const token = uni.getStorageSync("token");
      uniCloud
        .callFunction({
          name: "menu",
          data: {
            action: "updateMenuData", // 可能存在的另一个备用接口
            menu_id: menuId.value,
            categories: menuInfo.value.categories,
            dishes: menuInfo.value.dishes,
            token: token,
            uid: userInfo.value._id,
          },
        })
        .then((res) => {
          console.log("尝试异步保存菜单变更:", res);
        })
        .catch((err) => {
          console.error("异步保存失败:", err);
        });
    } catch (saveError) {
      console.error("尝试保存菜单变更失败:", saveError);
    }

    return true;
  } catch (e) {
    console.error("手动删除分类失败:", e);
    return false;
  }
};

// 删除分类
const deleteCategory = async (categoryId) => {
  if (!canEdit.value) {
    permissionTipText.value = "仅菜单创建者可以删除分类";
    showPermissionTip.value = true;
    setTimeout(() => {
      showPermissionTip.value = false;
    }, 2000);
    return;
  }

  uni.showLoading({
    title: "删除中...",
    mask: true,
  });

  try {
    // 详细记录操作日志
    console.log(`开始删除分类，ID: ${categoryId}`);

    const token = uni.getStorageSync("token");
    const uid = userInfo.value._id;

    // 更新本地数据结构 - 先从内存中删除
    const updatedCategories = menuInfo.value.categories.filter(
      (category) => category.category_id !== categoryId
    );

    // 将分类下的菜品移动到默认分类（全部）
    const updatedDishes = menuInfo.value.dishes.map((dish) => {
      if (dish.category_id === categoryId) {
        return { ...dish, category_id: "" };
      }
      return dish;
    });

    console.log(
      `准备调用云函数删除分类，当前分类数量: ${menuInfo.value.categories.length}, 删除后: ${updatedCategories.length}`
    );

    // 调用云函数更新菜单
    const res = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "updateMenu",
        menu_id: menuId.value,
        update: {
          categories: updatedCategories,
          dishes: updatedDishes,
        },
        token: token,
        uid: uid,
      },
    });

    console.log(`删除分类云函数返回:`, res);

    if (res.result && res.result.code === 0) {
      // 更新本地菜单信息
      menuInfo.value.categories = updatedCategories;
      menuInfo.value.dishes = updatedDishes;

      // 切换到全部分类
      currentCategory.value = "all";

      uni.showToast({
        title: "删除成功",
        icon: "success",
      });
      return true; // 显式返回成功标志
    } else {
      const errorMsg =
        res.result && res.result.message
          ? res.result.message
          : res.result && res.result.msg
          ? res.result.msg
          : "删除分类失败";
      console.error(`云函数删除分类失败: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  } catch (e) {
    console.error(`删除分类出错，详细错误:`, e);
    console.error(`错误堆栈:`, e.stack);
    // 不在这里显示错误提示，而是将错误抛出，让调用方处理
    throw e;
  } finally {
    uni.hideLoading();
  }
};

// 删除分类（备用方法）
const deleteCategoryFallback = async (categoryId) => {
  if (!canEdit.value) {
    permissionTipText.value = "仅菜单创建者可以删除分类";
    showPermissionTip.value = true;
    setTimeout(() => {
      showPermissionTip.value = false;
    }, 2000);
    return;
  }

  uni.showLoading({
    title: "删除中...",
    mask: true,
  });

  try {
    const token = uni.getStorageSync("token");

    // 先获取最新的菜单信息
    const menuRes = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "getMenuDetail",
        menu_id: menuId.value,
        token: token,
        uid: userInfo.value._id,
      },
    });

    if (menuRes.result.code !== 0) {
      throw new Error("获取菜单信息失败");
    }

    // 更新本地菜单信息
    const latest = menuRes.result.data;

    // 从分类列表中删除该分类
    const updatedCategories = latest.categories.filter(
      (category) => category.category_id !== categoryId
    );

    // 将该分类下的菜品分类清空（移到全部分类下）
    const updatedDishes = latest.dishes.map((dish) => {
      if (dish.category_id === categoryId) {
        return { ...dish, category_id: "" };
      }
      return dish;
    });

    console.log("尝试备用方法删除分类，尝试一系列可能的action名称");

    // 尝试可能的备用API名称
    let success = false;

    // 可能的API名称列表
    const possibleActions = [
      "saveMenu",
      "updateMenuData",
      "updateMenuContent",
      "saveMenuData",
      "setMenu",
      "setMenuData",
      "updateMenuFull",
    ];

    // 依次尝试每一个可能的API
    for (const action of possibleActions) {
      try {
        console.log(`尝试使用 action=${action} 删除分类`);

        const res = await uniCloud.callFunction({
          name: "menu",
          data: {
            action: action,
            menu_id: menuId.value,
            categories: updatedCategories,
            dishes: updatedDishes,
            token: token,
            uid: userInfo.value._id,
          },
        });

        console.log(`使用 action=${action} 返回结果:`, res);

        if (res.result && (res.result.code === 0 || res.result.status === 0)) {
          console.log(`使用 action=${action} 成功删除分类`);
          success = true;

          // 更新本地菜单信息
          menuInfo.value.categories = updatedCategories;
          menuInfo.value.dishes = updatedDishes;

          // 切换到全部分类
          currentCategory.value = "all";

          uni.showToast({
            title: "删除成功",
            icon: "success",
          });

          break; // 成功后退出循环
        }
      } catch (actionError) {
        console.error(`尝试 action=${action} 出错:`, actionError);
        // 继续尝试下一个action
      }
    }

    if (!success) {
      throw new Error("所有备用方法都失败");
    }

    return true;
  } catch (e) {
    console.error("所有备用删除分类方法都失败:", e);
    throw e;
  } finally {
    uni.hideLoading();
  }
};

// 手动删除菜品（最终备用方案）
const deleteDishManually = async (dishId) => {
  try {
    // 获取要删除的菜品信息
    const dish = menuInfo.value.dishes.find((d) => d.dish_id === dishId);
    const dishName = dish ? dish.name : "菜品";

    // 从本地菜品列表中删除该菜品
    menuInfo.value.dishes = menuInfo.value.dishes.filter(
      (d) => d.dish_id !== dishId
    );

    // 显示成功消息
    uni.showToast({
      title: `删除${dishName}成功`,
      icon: "success",
    });

    // 检查当前分类是否还有菜品
    if (currentCategory.value !== "all") {
      const dishesInCurrentCategory = menuInfo.value.dishes.filter(
        (d) => d.category_id === currentCategory.value
      );

      // 如果当前分类下没有菜品了，切换到全部分类
      if (dishesInCurrentCategory.length === 0) {
        currentCategory.value = "all";
      }
    }

    // 尝试异步保存变更到服务器（不等待结果）
    try {
      const token = uni.getStorageSync("token");
      uniCloud
        .callFunction({
          name: "menu",
          data: {
            action: "updateMenuData", // 可能存在的另一个备用接口
            menu_id: menuId.value,
            categories: menuInfo.value.categories,
            dishes: menuInfo.value.dishes,
            token: token,
            uid: userInfo.value._id,
          },
        })
        .then((res) => {
          console.log("尝试异步保存菜单变更:", res);
        })
        .catch((err) => {
          console.error("异步保存失败:", err);
        });
    } catch (saveError) {
      console.error("尝试保存菜单变更失败:", saveError);
    }

    return true;
  } catch (e) {
    console.error("手动删除菜品失败:", e);
    return false;
  }
};

// 菜品删除备用方法
const deleteDishFallback = async (dishId) => {
  if (!canEdit.value) {
    permissionTipText.value = "仅菜单创建者可以删除菜品";
    showPermissionTip.value = true;
    setTimeout(() => {
      showPermissionTip.value = false;
    }, 2000);
    return;
  }

  uni.showLoading({
    title: "删除中...",
    mask: true,
  });

  try {
    const token = uni.getStorageSync("token");

    // 先获取最新的菜单信息
    const menuRes = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "getMenuDetail",
        menu_id: menuId.value,
        token: token,
        uid: userInfo.value._id,
      },
    });

    if (menuRes.result.code !== 0) {
      throw new Error("获取菜单信息失败");
    }

    // 更新本地菜单信息
    const latest = menuRes.result.data;

    // 从菜品列表中删除该菜品
    const updatedDishes = latest.dishes.filter(
      (dish) => dish.dish_id !== dishId
    );

    console.log("尝试备用方法删除菜品，尝试一系列可能的action名称");

    // 尝试可能的备用API名称
    let success = false;

    // 可能的API名称列表
    const possibleActions = [
      "saveMenu",
      "updateMenuData",
      "updateMenuContent",
      "saveMenuData",
      "setMenu",
      "setMenuData",
      "updateMenuFull",
      "removeDish",
    ];

    // 依次尝试每一个可能的API
    for (const action of possibleActions) {
      try {
        console.log(`尝试使用 action=${action} 删除菜品`);

        // 根据不同的action name可能需要不同的参数格式
        let data = {
          action: action,
          menu_id: menuId.value,
          token: token,
          uid: userInfo.value._id,
        };

        // 针对不同的action设置不同的参数
        if (action === "removeDish") {
          data.dish_id = dishId;
        } else {
          data.dishes = updatedDishes;
        }

        const res = await uniCloud.callFunction({
          name: "menu",
          data: data,
        });

        console.log(`使用 action=${action} 返回结果:`, res);

        if (res.result && (res.result.code === 0 || res.result.status === 0)) {
          console.log(`使用 action=${action} 成功删除菜品`);
          success = true;

          // 更新本地菜单信息
          menuInfo.value.dishes = updatedDishes;

          uni.showToast({
            title: "删除成功",
            icon: "success",
          });

          break; // 成功后退出循环
        }
      } catch (actionError) {
        console.error(`尝试 action=${action} 出错:`, actionError);
        // 继续尝试下一个action
      }
    }

    if (!success) {
      throw new Error("所有备用方法都失败");
    }

    return true;
  } catch (e) {
    console.error("所有备用删除菜品方法都失败:", e);
    throw e;
  } finally {
    uni.hideLoading();
  }
};

// 删除菜品
const deleteDish = async (dishId) => {
  if (!canEdit.value) {
    permissionTipText.value = "仅菜单创建者可以删除菜品";
    showPermissionTip.value = true;
    setTimeout(() => {
      showPermissionTip.value = false;
    }, 2000);
    return;
  }

  uni.showLoading({
    title: "删除中...",
    mask: true,
  });

  try {
    // 详细记录操作日志
    console.log(`开始删除菜品，ID: ${dishId}`);

    const token = uni.getStorageSync("token");
    const uid = userInfo.value._id;

    // 从内存中删除该菜品
    const updatedDishes = menuInfo.value.dishes.filter(
      (dish) => dish.dish_id !== dishId
    );

    console.log(
      `准备调用云函数删除菜品，当前菜品数量: ${menuInfo.value.dishes.length}, 删除后: ${updatedDishes.length}`
    );

    // 调用云函数更新菜单
    const res = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "updateMenu",
        menu_id: menuId.value,
        update: {
          dishes: updatedDishes,
        },
        token: token,
        uid: uid,
      },
    });

    console.log(`删除菜品云函数返回:`, res);

    if (res.result && res.result.code === 0) {
      // 更新本地菜单信息
      menuInfo.value.dishes = updatedDishes;

      uni.showToast({
        title: "删除成功",
        icon: "success",
      });
      return true; // 显式返回成功标志
    } else {
      const errorMsg =
        res.result && res.result.message
          ? res.result.message
          : res.result && res.result.msg
          ? res.result.msg
          : "删除菜品失败";
      console.error(`云函数删除菜品失败: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  } catch (e) {
    console.error(`删除菜品出错，详细错误:`, e);
    console.error(`错误堆栈:`, e.stack);
    // 不在这里显示错误提示，而是将错误抛出，让调用方处理
    throw e;
  } finally {
    uni.hideLoading();
  }
};

// 打开编辑菜单对话框
const showEditMenuPopup = () => {
  console.log("打开编辑菜单对话框", {
    menuName: menuInfo.value.name,
    menuDescription: menuInfo.value.description,
  });
  editMenuForm.value.name = menuInfo.value.name || "";
  editMenuForm.value.description = menuInfo.value.description || "";
  showEditMenuDialog.value = true;
};

// 关闭编辑菜单弹窗
const closeEditMenuPopup = () => {
  showEditMenuDialog.value = false;
};

// 更新菜单信息
const updateMenuInfo = async () => {
  try {
    if (!editMenuForm.value.name.trim()) {
      uni.showToast({
        title: "请输入菜单名称",
        icon: "none",
      });
      return;
    }

    uni.showLoading({
      title: "保存中...",
    });

    // 更新菜单信息
    const { result } = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "updateMenu",
        menu_id: menuId.value, // 确保使用menu_id而不是menuId
        update: {
          name: editMenuForm.value.name,
          description: editMenuForm.value.description,
        },
        token: uni.getStorageSync("token"),
        uid: userInfo.value._id,
      },
    });

    if (result && result.code === 0) {
      // 更新本地数据
      menuInfo.value.name = editMenuForm.value.name;
      menuInfo.value.description = editMenuForm.value.description;

      uni.showToast({
        title: "保存成功",
        icon: "success",
      });
      showEditMenuDialog.value = false;
    } else {
      throw new Error(result?.message || "保存失败");
    }
  } catch (error) {
    console.error("更新菜单信息失败:", error);
    console.error("错误详情:", error.stack); // 添加更详细的错误日志
    uni.showToast({
      title: "保存失败: " + (error.message || "请重试"),
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 判断是否是菜单创建者
const isMenuCreator = computed(() => {
  // 获取创建者ID
  let creatorId = String(menuInfo.value.creator_id || "");

  // 获取当前用户ID（优先从userInfo中获取）
  let currentUserId = "";
  if (userInfo.value && userInfo.value._id) {
    currentUserId = String(userInfo.value._id);
  } else if (uid.value) {
    currentUserId = String(uid.value);
  }

  // 判断状态是否允许编辑
  let isValidStatus =
    menuInfo.value.status === 0 ||
    menuInfo.value.status === "0" ||
    menuInfo.value.status === null ||
    menuInfo.value.status === undefined;

  console.log("编辑按钮条件检查:", {
    creatorId: creatorId,
    currentUserId: currentUserId,
    userInfoId: userInfo.value ? userInfo.value._id : null,
    uidValue: uid.value,
    status: menuInfo.value.status,
    isCreator: creatorId === currentUserId,
    isValidStatus: isValidStatus,
  });

  // 强制检查一次
  if (creatorId && userInfo.value && userInfo.value._id) {
    const directCompare = String(creatorId) === String(userInfo.value._id);
    if (directCompare && !isValidStatus) {
      console.log("用户是创建者，但菜单状态不允许编辑");
    }
    return directCompare && isValidStatus;
  }

  return creatorId === currentUserId && isValidStatus;
});

// 安全的云函数调用，带重试机制
const safeCloudCall = async (options) => {
  const {
    name,
    data,
    maxRetries = 2,
    retryDelay = 1000,
    successCallback,
    failCallback,
  } = options;

  let retryCount = 0;
  let lastError = null;

  // 记录开始时间
  const startTime = Date.now();

  while (retryCount <= maxRetries) {
    try {
      console.log(
        `[云函数调用] ${name} 第${
          retryCount > 0 ? retryCount + "次重试" : "1次尝试"
        }`
      );
      console.log(`[云函数参数] ${JSON.stringify(data)}`);

      // 调用云函数
      const res = await uniCloud.callFunction({
        name,
        data,
      });

      // 记录响应时间
      const responseTime = Date.now() - startTime;
      console.log(`[云函数响应] ${name} 耗时: ${responseTime}ms`);
      console.log(`[云函数结果] ${JSON.stringify(res.result)}`);

      // 检查结果是否成功
      if (res.result && res.result.code === 0) {
        // 成功回调
        if (typeof successCallback === "function") {
          return successCallback(res.result);
        }
        return { success: true, data: res.result.data, result: res.result };
      } else {
        // 记录错误
        lastError = new Error(
          res.result?.message || res.result?.msg || "云函数返回错误"
        );
        lastError.result = res.result;

        // 如果达到最大重试次数，抛出错误
        if (retryCount >= maxRetries) {
          throw lastError;
        }

        // 否则重试
        retryCount++;
        console.log(
          `[云函数重试] ${name} 将在${retryDelay}ms后进行第${retryCount}次重试`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      // 记录错误
      lastError = error;
      console.error(`[云函数错误] ${name} 错误:`, error);

      // 如果达到最大重试次数，抛出错误
      if (retryCount >= maxRetries) {
        // 失败回调
        if (typeof failCallback === "function") {
          return failCallback(error);
        }
        throw error;
      }

      // 否则重试
      retryCount++;
      console.log(
        `[云函数重试] ${name} 将在${retryDelay}ms后进行第${retryCount}次重试`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  // 如果所有重试都失败，抛出最后一个错误
  throw lastError;
};

// 新增：定时轮询云端购物车
let cartSyncTimer = null;

// 云端购物车同步函数
const syncCartToCloud = async () => {
  if (!menuId.value || !userInfo.value || !userInfo.value._id) return;
  try {
    await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "syncSharedCart", // 修改action名称
        menu_id: menuId.value,
        user_id: userInfo.value._id,
        cart: cart.value,
        nickname: userInfo.value.nickname || "未知用户",
      },
    });
  } catch (e) {
    console.error("同步购物车到云端失败", e);
  }
};

const fetchCartFromCloud = async () => {
  if (!menuId.value) return;
  try {
    const res = await uniCloud.callFunction({
      name: "menu",
      data: {
        action: "getSharedCart", // 修改action名称
        menu_id: menuId.value,
      },
    });
    if (res.result.code === 0 && res.result.data) {
      cart.value = res.result.data.cart || [];
      // 更新菜单订单状态
      if (res.result.data.orderStatus) {
        // 只有本地未下单时才弹窗跳转，避免重复弹窗
        if (
          !menuOrderStatus.value.isOrdered &&
          res.result.data.orderStatus.isOrdered
        ) {
          menuOrderStatus.value = res.result.data.orderStatus;
          uni.showToast({
            title: `${menuOrderStatus.value.orderUser || "好友"}已下单`,
            icon: "none",
            duration: 1500,
          });
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/order/detail?id=${menuOrderStatus.value.orderId}`,
            });
          }, 1500);
        } else {
          menuOrderStatus.value = res.result.data.orderStatus;
        }
      }
    }
  } catch (e) {
    console.error("获取共享购物车失败", e);
  }
};

// 修改startCartPolling函数
const startCartPolling = () => {
  if (cartSyncTimer) clearInterval(cartSyncTimer);
  cartSyncTimer = setInterval(() => {
    fetchCartFromCloud();
  }, 3000);
};

// 新增：定时轮询订单，检测好友下单
let orderPollingTimer = null;
let lastOrderIds = [];
const startOrderPolling = () => {
  if (orderPollingTimer) clearInterval(orderPollingTimer);
  orderPollingTimer = setInterval(async () => {
    if (!menuId.value) return;
    try {
      const res = await uniCloud.callFunction({
        name: "menu",
        data: {
          action: "getMenuOrders",
          menu_id: menuId.value,
        },
      });
      if (res.result.code === 0 && Array.isArray(res.result.data)) {
        const orders = res.result.data;
        // 检查是否有新订单且不是自己下单
        const newOrder = orders.find(
          (o) =>
            !lastOrderIds.includes(o._id) &&
            o.user_id !== (userInfo.value && userInfo.value._id)
        );
        if (newOrder) {
          uni.showToast({
            title: "好友已下单",
            icon: "none",
            duration: 3000,
          });
          // 可自动跳转到订单详情页
          // uni.navigateTo({ url: `/pages/order/detail?id=${newOrder._id}` });
        }
        lastOrderIds = orders.map((o) => o._id);
      }
    } catch (e) {
      // 忽略错误
    }
  }, 3000);
};

onMounted(() => {
  fetchCartFromCloud(); // 初始获取共享购物车
  startCartPolling();
});
onUnmounted(() => {
  if (cartSyncTimer) clearInterval(cartSyncTimer);
  if (orderPollingTimer) clearInterval(orderPollingTimer);
});

// 下单后自动完成菜单和订单
const submitOrder = async () => {
  if (menuOrderStatus.value.isOrdered) {
    uni.showToast({
      title: "已有好友下单，无法重复下单",
      icon: "none",
    });
    return;
  }
  if (cart.value.length === 0) {
    uni.showToast({
      title: "请先添加菜品",
      icon: "none",
    });
    return;
  }
  uni.showLoading({
    title: "提交中...",
    mask: true,
  });
  try {
    const token = uni.getStorageSync("token");
    const res = await uniCloud.callFunction({
      name: "order",
      data: {
        action: "createSharedOrder", // 修改action名称
        menu_id: menuId.value,
        dishes: cart.value,
        total: cartTotal.value,
        token: token,
        uid: userInfo.value._id,
        nickname: userInfo.value.nickname || "未知用户",
      },
    });
    if (res.result.code === 0) {
      // 更新菜单状态
      menuOrderStatus.value = {
        isOrdered: true,
        orderId: res.result.data.order_id,
        orderUser: userInfo.value.nickname || "未知用户",
      };
      // 同步到云端
      await uniCloud.callFunction({
        name: "menu",
        data: {
          action: "updateMenuOrderStatus",
          menu_id: menuId.value,
          orderStatus: menuOrderStatus.value,
        },
      });
      clearCart();
      uni.showToast({
        title: "下单成功",
        icon: "success",
      });
      // 跳转到订单详情页
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/order/detail?id=${res.result.data.order_id}`,
        });
      }, 1500);
    } else {
      throw new Error(res.result.message || res.result.msg);
    }
  } catch (e) {
    uni.showToast({
      title: "下单失败: " + (e.message || "请重试"),
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};
</script>

<style lang="scss" scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
  padding-top: 20rpx; /* 添加顶部间距 */
}

.menu-header {
  padding: 24rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
  border-radius: 20rpx;
  margin: 0 20rpx 20rpx;

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    flex: 1;
    overflow: hidden;
  }

  .menu-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
    color: #333;

    .edit-btn {
      margin-left: 15rpx; /* 增加左侧间距 */
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36rpx;
      width: 36rpx;
      opacity: 0.6; /* 降低透明度使其不太显眼 */

      image {
        width: 28rpx;
        height: 28rpx;
      }
    }

    .menu-status {
      margin-left: 20rpx;
      font-size: 22rpx;
      background-color: #8bc34a;
      color: #fff;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
    }
  }

  .menu-description {
    font-size: 24rpx;
    color: #666;
    width: 80%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-right {
    margin-left: 20rpx;
  }

  .menu-participants {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .participants-list {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;

      .participant-avatar {
        width: 50rpx;
        height: 50rpx;
        border-radius: 50%;
        margin-left: -10rpx;
        border: 2rpx solid #fff;
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      }

      .participants-count {
        width: 50rpx;
        height: 50rpx;
        border-radius: 50%;
        background-color: #f5f5f5;
        color: #666;
        font-size: 22rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 5rpx;
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
      }
    }

    .invite-btn {
      display: flex;
      align-items: center;
      padding: 6rpx 16rpx;
      background-color: #fa9153;
      border-radius: 30rpx;
      color: #fff;
      font-size: 22rpx;
      box-shadow: 0 4rpx 8rpx rgba(250, 145, 83, 0.2);

      text {
        margin-left: 6rpx;
      }
    }
  }
}

.menu-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  border-radius: 20rpx;
  margin: 0 20rpx;

  .category-list {
    width: 180rpx;
    height: 100%;
    background-color: rgba(250, 145, 83, 0.03);
    border-radius: 20rpx 0 0 20rpx;

    .category-item {
      padding: 26rpx 20rpx;
      font-size: 28rpx;
      color: #555;
      position: relative;
      text-align: center;
      transition: all 0.3s;
      border-bottom: 1rpx solid rgba(0, 0, 0, 0.03);

      &.active {
        background-color: #fff;
        color: #fa9153;
        font-weight: bold;
        border-left: 4rpx solid #fa9153;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6rpx;
          height: 36rpx;
          background-color: transparent;
          border-radius: 3rpx;
        }
      }

      &:active {
        background-color: rgba(250, 145, 83, 0.05);
      }
    }

    .add-category {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx;
      font-size: 24rpx;
      color: #fa9153;
      margin-top: 10rpx;

      text {
        margin-left: 6rpx;
      }
    }
  }

  .dish-list {
    flex: 1;
    height: 100%;
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 150rpx; // 为固定购物车留出空间
    border-radius: 0 20rpx 20rpx 0;

    .dish-item {
      display: flex;
      margin-bottom: 30rpx;
      padding-bottom: 25rpx;
      border-bottom: 1rpx solid #f5f5f5;
      position: relative;
      transition: all 0.3s;

      &:active {
        transform: translateY(2rpx);
      }

      .dish-image {
        width: 150rpx;
        height: 150rpx;
        border-radius: 12rpx;
        margin-right: 20rpx;
        box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.08);
      }

      .dish-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .dish-name {
          font-size: 30rpx;
          font-weight: bold;
          margin-bottom: 8rpx;
          color: #333;
        }

        .dish-description {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 16rpx;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        .dish-price {
          font-size: 32rpx;
          color: #fa9153;
          font-weight: bold;
        }
      }

      .dish-actions {
        width: 120rpx;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding-bottom: 10rpx;

        .dish-count {
          display: flex;
          align-items: center;
          background-color: #f8f8f8;
          border-radius: 30rpx;
          padding: 4rpx;
          box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);

          .minus,
          .plus {
            width: 40rpx;
            height: 40rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            border-radius: 50%;
            box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
            transition: all 0.2s;

            &:active {
              transform: scale(0.92);
              box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
            }
          }

          .count {
            min-width: 40rpx;
            text-align: center;
            font-size: 26rpx;
            font-weight: 500;
            padding: 0 4rpx;
          }
        }

        .add-btn {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          background-color: #fa9153;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4rpx 10rpx rgba(250, 145, 83, 0.3);
          transition: all 0.2s;

          &:active {
            transform: scale(0.92);
            box-shadow: 0 2rpx 5rpx rgba(250, 145, 83, 0.2);
          }
        }

        .action-icon {
          width: 26rpx;
          height: 26rpx;
        }
      }
    }

    .empty-category {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-top: 100rpx;

      image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 20rpx;
      }

      text {
        font-size: 28rpx;
        color: #999;
        margin-bottom: 30rpx;
      }

      .add-dish-btn {
        padding: 16rpx 60rpx;
        background-color: #fa9153;
        color: #fff;
        border-radius: 40rpx;
        font-size: 28rpx;
      }
    }
  }
}

// 底部购物车
.cart-bar {
  position: fixed;
  left: 30rpx;
  right: 30rpx;
  bottom: 30rpx;
  height: 100rpx;
  background: linear-gradient(to right, #fa9153, #ff7048);
  display: flex;
  border-radius: 50rpx;
  z-index: 99;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(250, 145, 83, 0.3);

  .cart-info {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 0 30rpx;

    .cart-icon {
      position: relative;
      margin-right: 20rpx;

      .cart-badge {
        position: absolute;
        top: -10rpx;
        right: -10rpx;
        background-color: #fff;
        color: #fa9153;
        font-size: 20rpx;
        min-width: 36rpx;
        height: 36rpx;
        border-radius: 18rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6rpx;
        font-weight: bold;
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      }
    }

    .cart-price {
      font-size: 28rpx;
      color: #fff;

      .price {
        color: #fff;
        font-weight: bold;
      }
    }
  }

  .submit-btn {
    width: 240rpx;
    background-color: #fff;
    color: #fa9153;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    position: relative;

    &:active {
      opacity: 0.9;
    }

    &::after {
      content: "";
      position: absolute;
      left: 0;
      top: 15rpx;
      bottom: 15rpx;
      width: 1rpx;
      background-color: rgba(250, 145, 83, 0.1);
    }
  }
}

// 购物车弹出层
.cart-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.cart-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 1000;
  border-radius: 30rpx 30rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.3s;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);

  &.cart-popup-show {
    transform: translateY(0);
  }

  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx; /* 减少顶部内边距 */
    border-bottom: 1rpx solid #f5f5f5;

    .cart-title {
      font-size: 32rpx;
      font-weight: bold;
    }

    .cart-clear {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #999;

      text {
        margin-left: 6rpx;
      }
    }
  }

  .cart-list {
    flex: 1;
    padding: 0 30rpx;
    overflow-y: auto; /* 确保可以滚动 */

    .cart-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0; /* 减少内边距 */
      border-bottom: 1rpx solid #f5f5f5;

      .cart-item-image {
        width: 100rpx; /* 减小图片尺寸 */
        height: 100rpx;
        border-radius: 10rpx;
        margin-right: 15rpx; /* 减少边距 */
        flex-shrink: 0; /* 防止图片缩小 */
      }

      .cart-item-info {
        flex: 1;
        min-width: 0; /* 确保能够收缩 */
        padding-right: 10rpx; /* 右侧留出空间 */

        .cart-item-name {
          font-size: 28rpx;
          margin-bottom: 8rpx;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cart-item-price {
          font-size: 30rpx;
          color: #fa9153;
          font-weight: bold;
        }
      }

      .cart-item-actions {
        display: flex;
        align-items: center;
        padding-right: 50rpx; /* 增加右侧内边距，确保按钮不会溢出 */
        width: 150rpx; /* 给操作区域一个固定宽度 */
        justify-content: flex-end; /* 靠右对齐 */
        flex-shrink: 0; /* 防止缩小 */

        .cart-item-minus,
        .cart-item-plus {
          width: 44rpx; /* 略微减小按钮尺寸 */
          height: 44rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          border-radius: 50%;
          box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
          margin: 0 4rpx; /* 减少边距 */

          &:active {
            transform: scale(0.92);
            box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
          }
        }

        .cart-item-plus {
          background-color: #f8f8f8;
        }

        .cart-item-count {
          min-width: 36rpx; /* 减少宽度 */
          text-align: center;
          font-size: 26rpx; /* 减小字体 */
          font-weight: 500;
          padding: 0 3rpx; /* 减少内边距 */
        }

        .action-icon {
          width: 26rpx; /* 减小图标尺寸 */
          height: 26rpx;
        }
      }
    }
  }

  .cart-footer {
    display: flex;
    height: 100rpx;
    border-top: 1rpx solid #f5f5f5;

    .cart-total {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      font-size: 28rpx;

      .price {
        color: #fa9153;
        font-weight: bold;
        font-size: 32rpx;
      }
    }

    .cart-submit {
      width: 240rpx;
      background-color: #fa9153;
      color: #fff;
      font-size: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 管理员悬浮按钮
.float-add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 150rpx; // 调整位置，避免与购物车重叠
  height: 80rpx;
  padding: 0 30rpx;
  border-radius: 40rpx;
  background: linear-gradient(to right, #fa9153, #ff7048);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(250, 145, 83, 0.3);
  z-index: 98;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 10rpx rgba(250, 145, 83, 0.2);
  }

  text {
    color: #fff;
    font-size: 28rpx;
    margin-left: 10rpx;
    font-weight: bold;
  }
}

// 权限提示样式
.permission-tip {
  position: fixed;
  bottom: 180rpx; // 在购物车按钮上方
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 16rpx 30rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  z-index: 99;
  white-space: nowrap;
}

// 自定义弹窗样式
.custom-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.custom-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;

  .popup-content {
    background-color: #fff;
    border-radius: 20rpx;
    width: 650rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    overflow: hidden;

    &.dish-popup {
      max-height: 650rpx; /* 降低最大高度使弹窗更接近正方形 */
      overflow-y: auto;
      border-radius: 30rpx; /* 增加圆角效果 */
    }

    &.admin-popup {
      padding-top: 30rpx;
      border-radius: 30rpx; /* 增加圆角效果 */
    }

    .popup-title {
      font-size: 36rpx;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20rpx; /* 减少底部间距 */
      padding-top: 20rpx; /* 增加顶部内边距 */
    }

    .popup-form {
      padding: 0 30rpx 20rpx; /* 减少底部内边距 */

      .form-item {
        margin-bottom: 15rpx; /* 减少表单项间距 */

        .form-label {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx; /* 减少标签底部间距 */
        }

        .form-input,
        .form-textarea,
        .picker-view {
          width: 100%;
          padding: 15rpx; /* 减少内边距 */
          border: 1rpx solid #eee;
          border-radius: 10rpx;
          font-size: 28rpx;
          box-sizing: border-box;
          height: 70rpx; /* 略微减少高度 */
        }

        .form-textarea {
          height: 80rpx; /* 进一步减少文本区域高度 */
        }

        .picker-view {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70rpx; /* 保持一致高度 */
        }

        .image-uploader {
          width: 150rpx; /* 减小宽度 */
          height: 150rpx; /* 减小高度 */
          border: 1rpx dashed #ddd;
          border-radius: 10rpx;
          overflow: hidden;
          margin: 0 auto;

          .dish-upload-image {
            width: 100%;
            height: 100%;
          }

          .image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #f8f8f8;

            text {
              font-size: 24rpx;
              color: #999;
              margin-top: 10rpx;
            }
          }
        }
      }
    }

    .popup-buttons {
      display: flex;
      border-top: 1rpx solid #eee;

      .cancel-btn,
      .confirm-btn {
        flex: 1;
        height: 88rpx;
        line-height: 88rpx;
        text-align: center;
        font-size: 32rpx;
        border: none;
        border-radius: 0;
        background-color: #fff;
      }

      .cancel-btn {
        color: #666;
        border-right: 1rpx solid #eee;
      }

      .confirm-btn {
        color: #fa9153;
        font-weight: bold;
      }
    }
  }
}

/* 历史记录区域样式 */
.history-section {
  margin-bottom: 15rpx; /* 减少底部间距 */
  padding: 0 30rpx;
}

.history-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx; /* 减少标题底部间距 */
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx; /* 减少间隙 */
  margin-bottom: 15rpx; /* 减少底部间距 */
}

.history-item {
  background-color: #f8f8f8;
  padding: 6rpx 16rpx; /* 减少内边距 */
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #333;
  border: 1rpx solid #eee;
  transition: all 0.2s;
}

.history-item:active {
  background-color: #eee;
  transform: scale(0.98);
}

.history-dish-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 15rpx; /* 减少底部间距 */
}

.history-dish-list {
  display: inline-flex;
  padding: 8rpx 0; /* 减少内边距 */
}

.history-dish-item {
  width: 140rpx; /* 减少宽度 */
  margin-right: 12rpx; /* 减少右边距 */
  background-color: #f8f8f8;
  border-radius: 10rpx; /* 减少圆角 */
  overflow: hidden;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05); /* 减轻阴影 */
  border: 1rpx solid #f0f0f0;
  transition: all 0.2s;
}

.history-dish-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.05);
}

.history-dish-image {
  width: 140rpx; /* 与父容器宽度一致 */
  height: 140rpx; /* 减少高度 */
  background-color: #f5f5f5;
}

.history-dish-info {
  padding: 8rpx; /* 减少内边距 */
}

.history-dish-name {
  font-size: 22rpx; /* 减小字体 */
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  margin-bottom: 4rpx; /* 减少底部间距 */
}

.history-dish-price {
  font-size: 20rpx; /* 减小字体 */
  color: #fa9153;
}

/* 图片上传样式优化 */
.image-uploader {
  width: 150rpx; /* 减小宽度 */
  height: 150rpx; /* 减小高度 */
  border: 1rpx dashed #ddd;
  border-radius: 10rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
}

.upload-text {
  font-size: 22rpx; /* 减小字体 */
  color: #999;
  margin-top: 8rpx; /* 减少顶部边距 */
}

.uploaded-image {
  width: 150rpx; /* 减小宽度 */
  height: 150rpx; /* 减小高度 */
  border-radius: 10rpx;
  border: 1rpx solid #eee;
}
</style> 