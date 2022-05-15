export default () => ({
    help: '创建和管理银行账户',
    subs: {
        create: {
            help: '创建银行账户',
            args: [ 
                { ty: 'str', name: 'name' },
                { ty: 'str', name: 'type' },
                { ty: '$uid' }
            ],
            fn: async (name, type, uid) => {
                if (type !== 'debit' && type !== 'credit') return '账户类型不合法'
                
                // Note: 开卡费
                const info = {
                    debit: {
                        fee: 0,
                        credit: 0
                    },
                    credit: {
                        fee: 1000,
                        credit: 1000
                    }
                }

                // Note: 首先先检查名称是否存在
                if (await bot.mongo.db
                    .collection('card')
                    .findOne({
                        _id: uid,
                        name: name
                    })) return '名称已被使用'

                // Note: 判断是否需要开卡费
                if (info[type].fee !== 0) {
                    // Note: 扣费
                    const user = await bot.mongo.db
                        .collection('bank')
                        .findOne({ _id: uid })

                    if (! user) return '无法查询到用户资料，您可能没有其他账户用于支付开卡费'

                    const card = await bot.mongo.db
                        .collection('card')
                        .findOne({
                            _id: uid,
                            name: user.active
                        })

                    if (card.coin < info[type].fee) return '余额不足（不能借款创建账户）'
                    await bot.mongo.db
                        .collection('card')
                        .updateOne({
                            _id: uid,
                            name: user.active
                        }, {
                            $inc: {
                                coin: -info[type].fee
                            }
                        })
                }

                await bot.mongo.db
                    .collection('card')
                    .insertOne({
                        _id: uid,
                        name: name,
                        type: type,
                        credit: info[type].credit,
                        lend: 0,
                        coin: 0
                    })

                return `成功创建账户 ${name}`
            }
        },
        select: {
            help: '选择激活的银行账户',
            args: [
                { ty: 'str', name: 'name' },
                { ty: '$uid' }
            ],
            fn: async (name, uid) => {
                const accounts = await bot.mongo.db
                    .collection('card')
                    .findOne({
                        _id: uid,
                        name: name
                    })

                if(! accounts) return '账户不存在'

                await bot.mongo.db
                    .collection('bank')
                    .updateOne({
                        _id: uid
                    }, {
                        $set: {
                            active: name
                        }
                    })

                return `已经将 ${name} 设置为活动账户`
            }
        }
    }
})
