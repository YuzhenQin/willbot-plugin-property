export const superusers = [439516995]

export const issue = async (uid, money) => {
    // Note: 先看有没有银行账户
    const active = await bot.mongo.db
        .collection('bank')
        .findOne({ _id: uid })
    if (! active) return false

    // Note: 打钱
    await bot.mongo.db
        .collection('card')
        .updateOne({
            _id: uid,
            name: active.active
        }, {
            $inc: {
                coin: money
            }
        })
    return true
}