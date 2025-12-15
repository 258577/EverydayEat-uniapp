'use strict';

const db = uniCloud.database();
const imagesCollection = db.collection('images');

// 获取用户ID
function getUserId(event) {
    const { token, uid } = event;
    let userId = uid;

    // 如果没有提供uid，尝试从token中获取
    if (!userId && token) {
        try {
            // 如果token是对象，直接获取uid
            if (typeof token === 'object' && token.uid) {
                userId = token.uid;
            } else if (typeof token === 'string') {
                // 尝试解析JSON字符串
                try {
                    const tokenObj = JSON.parse(token);
                    if (tokenObj && tokenObj.uid) {
                        userId = tokenObj.uid;
                    }
                } catch (e) {
                    // 如果token不是有效的JSON，则直接使用token作为userId
                    userId = token;
                }
            }
        } catch (e) {
            console.error('解析token失败:', e);
        }
    }

    return userId;
}

// 获取所有图片
async function getAllImages(event, context) {
    try {
        const { category } = event;
        let query = {};

        // 如果指定了分类，则按分类筛选
        if (category) {
            query.category = category;
        }

        const { data } = await imagesCollection.where(query).get();

        return {
            code: 0,
            message: '获取图片列表成功',
            data
        };
    } catch (e) {
        console.error('获取图片列表失败:', e);
        return {
            code: 1,
            message: '获取图片列表失败: ' + e.message
        };
    }
}

// 添加图片
async function addImage(event, context) {
    const userId = getUserId(event);
    if (!userId) {
        return {
            code: 1,
            message: '未登录或登录已过期'
        };
    }

    try {
        const { name, title, url, buttonColor, category, description } = event;

        // 验证必填字段
        if (!name || !url) {
            return {
                code: 1,
                message: '图片名称和路径不能为空'
            };
        }

        const imageData = {
            name,
            title: title || name,
            url,
            buttonColor: buttonColor || '#3498db',
            category: category || 'default',
            description: description || '',
            creator_id: userId,
            create_date: new Date(),
            update_date: new Date()
        };

        const result = await imagesCollection.add(imageData);

        return {
            code: 0,
            message: '添加图片成功',
            data: {
                id: result.id
            }
        };
    } catch (e) {
        console.error('添加图片失败:', e);
        return {
            code: 1,
            message: '添加图片失败: ' + e.message
        };
    }
}

// 更新图片信息
async function updateImage(event, context) {
    const userId = getUserId(event);
    if (!userId) {
        return {
            code: 1,
            message: '未登录或登录已过期'
        };
    }

    try {
        const { id, name, title, url, buttonColor, category, description } = event;

        // 验证必填字段
        if (!id) {
            return {
                code: 1,
                message: '图片ID不能为空'
            };
        }

        // 构建更新数据
        const updateData = {};
        if (name) updateData.name = name;
        if (title) updateData.title = title;
        if (url) updateData.url = url;
        if (buttonColor) updateData.buttonColor = buttonColor;
        if (category) updateData.category = category;
        if (description) updateData.description = description;
        updateData.update_date = new Date();

        // 更新图片信息
        await imagesCollection.doc(id).update(updateData);

        return {
            code: 0,
            message: '更新图片信息成功'
        };
    } catch (e) {
        console.error('更新图片信息失败:', e);
        return {
            code: 1,
            message: '更新图片信息失败: ' + e.message
        };
    }
}

// 删除图片
async function deleteImage(event, context) {
    const userId = getUserId(event);
    if (!userId) {
        return {
            code: 1,
            message: '未登录或登录已过期'
        };
    }

    try {
        const { id } = event;

        // 验证必填字段
        if (!id) {
            return {
                code: 1,
                message: '图片ID不能为空'
            };
        }

        // 检查图片是否存在并且是当前用户创建的
        const imageRes = await imagesCollection.doc(id).get();
        if (imageRes.data.length === 0) {
            return {
                code: 1,
                message: '图片不存在'
            };
        }

        const image = imageRes.data[0];
        if (image.creator_id !== userId) {
            return {
                code: 1,
                message: '无权删除该图片'
            };
        }

        // 删除图片
        await imagesCollection.doc(id).remove();

        return {
            code: 0,
            message: '删除图片成功'
        };
    } catch (e) {
        console.error('删除图片失败:', e);
        return {
            code: 1,
            message: '删除图片失败: ' + e.message
        };
    }
}

// 获取单个图片详情
async function getImageDetail(event, context) {
    try {
        const { id } = event;

        // 验证必填字段
        if (!id) {
            return {
                code: 1,
                message: '图片ID不能为空'
            };
        }

        // 查询图片详情
        const imageRes = await imagesCollection.doc(id).get();
        if (imageRes.data.length === 0) {
            return {
                code: 1,
                message: '图片不存在'
            };
        }

        return {
            code: 0,
            message: '获取图片详情成功',
            data: imageRes.data[0]
        };
    } catch (e) {
        console.error('获取图片详情失败:', e);
        return {
            code: 1,
            message: '获取图片详情失败: ' + e.message
        };
    }
}

// 云函数入口
exports.main = async (event, context) => {
    const { action } = event;

    // 根据action调用不同的处理函数
    switch (action) {
        case 'getAllImages':
            return await getAllImages(event, context);
        case 'addImage':
            return await addImage(event, context);
        case 'updateImage':
            return await updateImage(event, context);
        case 'deleteImage':
            return await deleteImage(event, context);
        case 'getImageDetail':
            return await getImageDetail(event, context);
        default:
            return {
                code: 1,
                message: '未知操作: ' + action
            };
    }
}; 