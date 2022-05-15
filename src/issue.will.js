import { superusers, issue } from './property-util'

export default () => ({
    help: '发行新的金币，需要超级用户权限',
    args: [ 
        { ty: '$uid' },
        { ty: 'number', name: 'amount' }
    ],
    fn: async (uid, amount) => {
        if (! (uid in superusers)) return '没有权限'

        if (! await issue(uid, amount)) return '发行金币失败'

        return `成功发行 ${amount} 枚硬币到您激活的账户`
    }
})