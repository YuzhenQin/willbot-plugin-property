export default () => ({
	help: 'Checkin and get some coins',
	args: [ { ty: '$uid' } ],
	fn: async (uid) => {
		// Note: 首先判断一天只能调用一次
		const property = await bot.mongo.db
			.collection('property')
			.findOne({ uid: uid })
		let coins

		// Note: 不在数据库里的先创建
		if(! property) {
			await bot.mongo.db
				.collection('property')
				.insertOne({
					uid: uid,
					lastCheckin: (new Date()).valueOf(),
					coin: 0
				})
			coins = 0
		}
		else {
			const lastCheckin = new Date(property.lastCheckin),
				now = new Date()

			// Note: 如果同一天已经签到过了
			if (lastCheckin.getFullYear() === now.getFullYear() ||
                lastCheckin.getMonth() === now.getMonth() ||
                lastCheckin.getDate() === now.getDate()) {
				return '您今天已经签到过了呢'
			}

			coins = property.coins
		}

		// Note: 打钱
		const newCoins = (Math.random() * 1e6 | 0) % 101
		await bot.mongo.db
			.collection('property')
			.updateOne({
				uid: uid
			}, {
				$set: {
					'coin': coins+newCoins
				}
			})
        
		return `获得了 ${newCoins} 个硬币`
	}
})
