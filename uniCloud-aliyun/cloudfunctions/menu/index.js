'use strict';

const db = uniCloud.database();
const menuCollection = db.collection('menu');
const usersCollection = db.collection('users');
const $ = db.command.aggregate;

// 生成唯一的分享码
function generateShareCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 获取当前日期
function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日`;
}

// 工具函数：从event中获取用户ID
function getUserId(event) {
    // 尝试从token获取uid，如果不存在则从event中获取
    let uid;
    if (event.uniIdToken) {
        uid = event.uniIdToken.uid;
    } else if (event.uid) {
        uid = event.uid;
    } else if (event.token && event.token.uid) {
        uid = event.token.uid;
    }

    return uid;
}

// 创建菜单
async function createMenu(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            msg: '未登录或用户ID不存在'
        };
    }

    try {
        // 获取用户信息
        const userInfo = await usersCollection.doc(uid).get();
        if (userInfo.data.length === 0) {
            return {
                code: -1,
                msg: '用户不存在'
            };
        }

        // 获取请求数据
        const { name, description } = event;

        const user = userInfo.data[0];

        // 创建菜单
        const menuData = {
            name: name || `${new Date().toLocaleDateString()} 菜单`,
            description: description || '',
            creator_id: uid,
            creator_info: {
                nickname: user.nickname,
                avatar: user.avatar
            },
            participants: [uid],
            participants_info: [{
                user_id: uid,
                nickname: user.nickname,
                avatar: user.avatar
            }],
            categories: [],
            dishes: [],
            status: 0,
            share_code: generateShareCode(),
            create_date: new Date(),
            update_date: new Date()
        };

        const result = await menuCollection.add(menuData);

        return {
            code: 0,
            msg: '创建菜单成功',
            data: {
                menu_id: result.id,
                menu_name: menuData.name
            }
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            msg: '创建菜单失败: ' + e.message
        };
    }
}

// 获取用户的菜单列表
async function getUserMenus(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            msg: '未登录或用户ID不存在'
        };
    }

    try {
        // 查询用户参与的菜单
        const menus = await menuCollection.where({
            participants: uid
        })
            .orderBy('create_date', 'desc')
            .get();

        return {
            code: 0,
            msg: '获取菜单列表成功',
            data: menus.data
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            msg: '获取菜单列表失败: ' + e.message
        };
    }
}

// 获取菜单详情
async function getMenuDetail(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            msg: '未登录或用户ID不存在'
        };
    }

    const { menu_id } = event;

    try {
        // 查询菜单
        const menu = await menuCollection.doc(menu_id).get();

        if (menu.data.length === 0) {
            return {
                code: -1,
                msg: '菜单不存在'
            };
        }

        // 取消参与者校验，任何用户都能查看菜单详情
        // const menuData = menu.data[0];
        // if (!menuData.participants.includes(uid)) {
        //     return {
        //         code: -1,
        //         msg: '无权访问该菜单'
        //     };
        // }

        return {
            code: 0,
            msg: '获取菜单详情成功',
            data: menu.data[0]
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            msg: '获取菜单详情失败: ' + e.message
        };
    }
}

// 添加菜品类型
async function addCategory(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            msg: '未登录或用户ID不存在'
        };
    }

    const { menu_id, name, sort = 0 } = event;

    try {
        // 查询菜单
        const menu = await menuCollection.doc(menu_id).get();

        if (menu.data.length === 0) {
            return {
                code: -1,
                msg: '菜单不存在'
            };
        }

        // 检查用户是否有权限
        const menuData = menu.data[0];
        if (!menuData.participants.includes(uid)) {
            return {
                code: -1,
                msg: '无权修改该菜单'
            };
        }

        // 生成类型ID
        const category_id = Date.now().toString();

        // 添加菜品类型
        await menuCollection.doc(menu_id).update({
            categories: db.command.push({
                category_id,
                name,
                sort
            }),
            update_date: new Date()
        });

        return {
            code: 0,
            msg: '添加菜品类型成功',
            data: {
                category_id
            }
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            msg: '添加菜品类型失败: ' + e.message
        };
    }
}

// 添加菜品
async function addDish(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            msg: '未登录或用户ID不存在'
        };
    }

    const { menu_id, category_id, name, image, description, price } = event;

    try {
        // 查询菜单
        const menu = await menuCollection.doc(menu_id).get();

        if (menu.data.length === 0) {
            return {
                code: -1,
                msg: '菜单不存在'
            };
        }

        // 检查用户是否有权限
        const menuData = menu.data[0];
        if (!menuData.participants.includes(uid)) {
            return {
                code: -1,
                msg: '无权修改该菜单'
            };
        }

        // 检查类型是否存在
        const categoryExists = menuData.categories.some(category => category.category_id === category_id);
        if (!categoryExists) {
            return {
                code: -1,
                msg: '菜品类型不存在'
            };
        }

        // 生成菜品ID
        const dish_id = Date.now().toString();

        // 添加菜品
        await menuCollection.doc(menu_id).update({
            dishes: db.command.push({
                dish_id,
                category_id,
                name,
                image,
                description,
                price: Number(price),
                create_user_id: uid
            }),
            update_date: new Date()
        });

        return {
            code: 0,
            msg: '添加菜品成功',
            data: {
                dish_id
            }
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            msg: '添加菜品失败: ' + e.message
        };
    }
}

// 加入菜单
async function joinMenu(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            msg: '未登录或用户ID不存在'
        };
    }

    // 支持通过 menu_id 或 share_code 加入
    const { share_code, menu_id } = event;

    try {
        // 查询用户信息
        const userInfo = await usersCollection.doc(uid).get();
        if (userInfo.data.length === 0) {
            return {
                code: -1,
                msg: '用户不存在'
            };
        }

        const user = userInfo.data[0];

        // 查询菜单（支持通过 menu_id 或 share_code）
        let menu;
        if (menu_id) {
            menu = await menuCollection.doc(menu_id).get();
        } else if (share_code) {
            menu = await menuCollection.where({ share_code: share_code }).get();
        } else {
            return {
                code: -1,
                msg: '缺少菜单ID或分享码'
            };
        }

        if (menu.data.length === 0) {
            return {
                code: -1,
                msg: '菜单不存在或分享码错误'
            };
        }

        const menuData = menu.data[0];

        // 检查用户是否已在参与者列表中
        if (menuData.participants.includes(uid)) {
            // 已经是参与者，也要确保myMenus有该菜单
            await usersCollection.doc(uid).update({
                myMenus: db.command.addToSet(menuData._id)
            });
            return {
                code: 0,
                msg: '您已经加入该菜单',
                data: {
                    menu_id: menuData._id
                }
            };
        }

        // 将用户添加到参与者列表
        await menuCollection.doc(menuData._id).update({
            participants: db.command.push(uid),
            participants_info: db.command.push({
                user_id: uid,
                nickname: user.nickname,
                avatar: user.avatar
            }),
            update_date: new Date()
        });

        // 把菜单ID加入用户的myMenus字段
        await usersCollection.doc(uid).update({
            myMenus: db.command.addToSet(menuData._id)
        });

        return {
            code: 0,
            msg: '加入菜单成功',
            data: {
                menu_id: menuData._id
            }
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            msg: '加入菜单失败: ' + e.message
        };
    }
}

// 更新菜单状态
async function updateMenuStatus(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在'
        };
    }

    const { menu_id, status } = event;

    try {
        // 查询菜单
        const menu = await menuCollection.doc(menu_id).get();

        if (menu.data.length === 0) {
            return {
                code: -1,
                message: '菜单不存在'
            };
        }

        // 获取菜单数据
        const menuData = menu.data[0];

        // 检查用户是否有权限（参与者都可以更新状态，但最好是创建者）
        if (!menuData.participants.includes(uid)) {
            return {
                code: -1,
                message: '无权修改该菜单'
            };
        }

        // 更新状态值
        let statusValue = status;
        if (status === 'completed' || status === 2) {
            statusValue = 'completed';
        } else if (status === 'pending' || status === 0) {
            statusValue = 'pending';
        } else if (status === 'adding' || status === 1) {
            statusValue = 'adding';
        }

        // 更新菜单状态
        await menuCollection.doc(menu_id).update({
            status: statusValue,
            update_time: Date.now()
        });

        return {
            code: 0,
            message: '更新菜单状态成功'
        };
    } catch (e) {
        console.error(e);
        return {
            code: -1,
            message: '更新菜单状态失败: ' + e.message
        };
    }
}

// 更新菜单（支持批量更新）
async function updateMenu(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在'
        };
    }

    const { menu_id, update } = event;

    try {
        // 查询菜单
        const menu = await menuCollection.doc(menu_id).get();

        if (menu.data.length === 0) {
            return {
                code: -1,
                message: '菜单不存在'
            };
        }

        // 获取菜单数据
        const menuData = menu.data[0];

        // 检查用户是否有权限（只有创建者可以更新菜单内容）
        if (menuData.creator_id !== uid) {
            return {
                code: -1,
                message: '只有菜单创建者可以更新菜单内容'
            };
        }

        // 更新菜单内容
        const updateData = { ...update, update_date: new Date() };
        await menuCollection.doc(menu_id).update(updateData);

        return {
            code: 0,
            message: '更新菜单成功'
        };
    } catch (e) {
        console.error('更新菜单出错:', e);
        return {
            code: -1,
            message: '更新菜单失败: ' + e.message
        };
    }
}

// 删除菜品类别
async function deleteCategory(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在'
        };
    }

    const { menu_id, category_id } = event;

    try {
        // 查询菜单
        const menu = await menuCollection.doc(menu_id).get();

        if (menu.data.length === 0) {
            return {
                code: -1,
                message: '菜单不存在'
            };
        }

        // 检查用户是否有权限
        const menuData = menu.data[0];
        if (menuData.creator_id !== uid) {
            return {
                code: -1,
                message: '只有菜单创建者可以删除分类'
            };
        }

        // 从分类数组中过滤掉要删除的分类
        const updatedCategories = menuData.categories.filter(
            category => category.category_id !== category_id
        );

        // 将该分类下的菜品移到"全部"分类下（设置category_id为空）
        const updatedDishes = menuData.dishes.map(dish => {
            if (dish.category_id === category_id) {
                return { ...dish, category_id: '' };
            }
            return dish;
        });

        // 更新菜单
        await menuCollection.doc(menu_id).update({
            categories: updatedCategories,
            dishes: updatedDishes,
            update_date: new Date()
        });

        return {
            code: 0,
            message: '删除分类成功'
        };
    } catch (e) {
        console.error('删除分类出错:', e);
        return {
            code: -1,
            message: '删除分类失败: ' + e.message
        };
    }
}

// 删除菜品
async function deleteDish(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在'
        };
    }

    const { menu_id, dish_id } = event;

    try {
        // 查询菜单
        const menu = await menuCollection.doc(menu_id).get();

        if (menu.data.length === 0) {
            return {
                code: -1,
                message: '菜单不存在'
            };
        }

        // 检查用户是否有权限
        const menuData = menu.data[0];
        if (menuData.creator_id !== uid) {
            return {
                code: -1,
                message: '只有菜单创建者可以删除菜品'
            };
        }

        // 从菜品数组中过滤掉要删除的菜品
        const updatedDishes = menuData.dishes.filter(
            dish => dish.dish_id !== dish_id
        );

        // 更新菜单
        await menuCollection.doc(menu_id).update({
            dishes: updatedDishes,
            update_date: new Date()
        });

        return {
            code: 0,
            message: '删除菜品成功'
        };
    } catch (e) {
        console.error('删除菜品出错:', e);
        return {
            code: -1,
            message: '删除菜品失败: ' + e.message
        };
    }
}

// 更新菜单数据（备用方法）
async function updateMenuData(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在'
        };
    }

    const { menu_id, categories, dishes } = event;

    try {
        // 查询菜单
        const menu = await menuCollection.doc(menu_id).get();

        if (menu.data.length === 0) {
            return {
                code: -1,
                message: '菜单不存在'
            };
        }

        // 检查用户是否有权限
        const menuData = menu.data[0];
        if (menuData.creator_id !== uid) {
            return {
                code: -1,
                message: '只有菜单创建者可以更新菜单数据'
            };
        }

        // 更新菜单
        const updateData = {};
        if (categories) updateData.categories = categories;
        if (dishes) updateData.dishes = dishes;
        updateData.update_date = new Date();

        await menuCollection.doc(menu_id).update(updateData);

        return {
            code: 0,
            message: '更新菜单数据成功'
        };
    } catch (e) {
        console.error('更新菜单数据出错:', e);
        return {
            code: -1,
            message: '更新菜单数据失败: ' + e.message
        };
    }
}

// 删除菜单
async function deleteMenu(event, context) {
    const uid = getUserId(event);
    if (!uid) {
        return {
            code: -1,
            message: '未登录或用户ID不存在'
        };
    }

    const { menu_id } = event;

    try {
        // 查询菜单
        const menu = await menuCollection.doc(menu_id).get();

        if (menu.data.length === 0) {
            return {
                code: -1,
                message: '菜单不存在'
            };
        }

        // 检查用户是否有权限（只有创建者可以删除菜单）
        const menuData = menu.data[0];
        if (menuData.creator_id !== uid) {
            return {
                code: -1,
                message: '只有菜单创建者可以删除菜单'
            };
        }

        // 删除菜单
        await menuCollection.doc(menu_id).remove();

        return {
            code: 0,
            message: '删除菜单成功'
        };
    } catch (e) {
        console.error('删除菜单出错:', e);
        return {
            code: -1,
            message: '删除菜单失败: ' + e.message
        };
    }
}

// 同步用户购物车到menu表
async function syncCart(event, context) {
    const { menu_id, user_id, cart } = event;
    if (!menu_id || !user_id) {
        return { code: -1, msg: '参数缺失' };
    }
    try {
        // 先获取当前carts
        const menuRes = await menuCollection.doc(menu_id).get();
        if (menuRes.data.length === 0) {
            return { code: -1, msg: '菜单不存在' };
        }
        const menuData = menuRes.data[0];
        let carts = menuData.carts || {};
        carts[user_id] = cart;
        await menuCollection.doc(menu_id).update({
            carts: carts,
            update_date: new Date()
        });
        return { code: 0, msg: '购物车同步成功' };
    } catch (e) {
        console.error('syncCart error', e);
        return { code: -1, msg: '购物车同步失败: ' + e.message };
    }
}

// 获取所有用户购物车
async function getAllCarts(event, context) {
    const { menu_id } = event;
    if (!menu_id) {
        return { code: -1, msg: '参数缺失' };
    }
    try {
        const menuRes = await menuCollection.doc(menu_id).get();
        if (menuRes.data.length === 0) {
            return { code: -1, msg: '菜单不存在' };
        }
        const carts = menuRes.data[0].carts || {};
        return { code: 0, msg: '获取购物车成功', data: carts };
    } catch (e) {
        console.error('getAllCarts error', e);
        return { code: -1, msg: '获取购物车失败: ' + e.message };
    }
}

// 获取菜单下所有订单
async function getMenuOrders(event, context) {
    const { menu_id } = event;
    if (!menu_id) {
        return { code: -1, msg: '参数缺失' };
    }
    try {
        const orders = await db.collection('orders').where({ menu_id }).orderBy('create_time', 'desc').get();
        return { code: 0, msg: '获取订单成功', data: orders.data };
    } catch (e) {
        console.error('getMenuOrders error', e);
        return { code: -1, msg: '获取订单失败: ' + e.message };
    }
}

// 完成菜单下所有订单，并将菜单状态设为已完成
async function completeMenuOrders(event, context) {
    const { menu_id } = event;
    if (!menu_id) {
        return { code: -1, msg: '参数缺失' };
    }
    try {
        // 更新所有订单状态
        await db.collection('orders').where({ menu_id }).update({ status: 'completed' });
        // 更新菜单状态
        await menuCollection.doc(menu_id).update({ status: 'completed', update_date: new Date() });
        return { code: 0, msg: '菜单及订单已全部完成' };
    } catch (e) {
        console.error('completeMenuOrders error', e);
        return { code: -1, msg: '批量完成失败: ' + e.message };
    }
}

exports.main = async (event, context) => {
    const { action } = event;

    if (action === 'joinMenu') {
        return await joinMenu(event);
    }

    switch (action) {
        case 'createMenu':
            return await createMenu(event, context);
        case 'getUserMenus':
            return await getUserMenus(event, context);
        case 'getMenuDetail':
            return await getMenuDetail(event, context);
        case 'addCategory':
            return await addCategory(event, context);
        case 'addDish':
            return await addDish(event, context);
        case 'joinMenu':
            return await joinMenu(event, context);
        case 'updateMenuStatus':
            return await updateMenuStatus(event, context);
        case 'updateMenu':
            return await updateMenu(event, context);
        case 'deleteCategory':
            return await deleteCategory(event, context);
        case 'deleteDish':
            return await deleteDish(event, context);
        case 'updateMenuData':
            return await updateMenuData(event, context);
        case 'deleteMenu':
            return await deleteMenu(event, context);
        case 'syncCart':
            return await syncCart(event, context);
        case 'getAllCarts':
            return await getAllCarts(event, context);
        case 'getMenuOrders':
            return await getMenuOrders(event, context);
        case 'completeMenuOrders':
            return await completeMenuOrders(event, context);
        default:
            return {
                code: -1,
                msg: '未知操作'
            };
    }
}; 