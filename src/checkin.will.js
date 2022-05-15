import dayjs from 'dayjs'
import { issue } from './property-util.js'

export default () => ({
    help: '签到并获得一些金币',
    args: [ { ty: '$uid' } ],
    fn: async (uid) => {
        // Note: 首先判断一天只能调用一次
        const property = await bot.mongo.db
            .collection('checkin')
            .findOne({ _id: uid })

        // Note: 先看有没有银行账户
        const active = await bot.mongo.db
            .collection('bank')
            .findOne({ _id: uid })
        if (! active) return '请先创建银行账户'

        // Note: 不在数据库里的先创建
        if(! property) {
            await bot.mongo.db
                .collection('checkin')
                .insertOne({
                    _id: uid,
                    lastCheckin: new Date
                })
        }
        else {
            const lastCheckin = property.lastCheckin,
                now = new Date

            // Note: 如果同一天已经签到过了
            if (dayjs(lastCheckin).isSame(now, 'day')) return '您今天已经签到过了呢'

            await bot.mongo.db
                .collection('checkin')
                .updateOne({
                    _id: uid
                }, {
                    $set: {
                        lastCheckin: new Date
                    }
                })
        }
        
        
        // Note: 打钱
        const newCoins = (Math.random() * 1e6 | 0) % 101
        if (! await issue(uid, newCoins)) return '发行金币失败'

        return `获得了 ${newCoins} 枚硬币`
    }
})
