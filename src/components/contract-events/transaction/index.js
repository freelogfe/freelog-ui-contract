import ACCOUNT_CONFIG from '../../../config/account-types'
import { Form, FormItem, Select, Tooltip, Button, Input, Option, Message } from 'element-ui'


export default {
  name: 'transaction-event',
  components: {
    "el-form": Form,
    "el-form-item": FormItem,
    "el-select": Select,
    "el-tooltip": Tooltip,
    "el-button": Button,
    "el-input": Input,
    "el-option": Option
  },
  props: {
    contractDetail: { type: Object },
    params: {type: Object },
  },
  data() {
    return {
      accountOptions: [],
      accountId: '',
      password: '',
      tipMsg: '',
      order: {},
      showError: false,
      isLoadingAccount: false,
    }
  },
  computed: {
    contractId() {
      return this.contractDetail.contractId
    },
    eventId() {
      return this.params.eventId
    },
    payType() {
      return this.params.payType || 'transaction'
    },
    unitType() {
      return this.params.currencyUnit
    },
    amount() {
      switch (this.unitType) {
        case 'feather': {
          return this.params.amount || 0
        }
        default: return 0
      }
    },
    targAount() {
      return parseInt(+this.amount * 1000)
    },
    isNeedPassword() {
      return this.payType === 'transaction' || this.payType === 'escrowExceed'
    },
    accountLabel() {
      switch (this.payType) {
        case 'transaction': {}
        case 'escrowExceed': {
          return '转出账号'
        }
        case 'escrowConfiscated': {}
        case 'escrowConfiscated': {
          return '保证金转入账户'
        }
      }
    },
    isCanSubmit() {
      if(this.isNeedPassword) {
        return this.accountId !== '' && this.password !== ''
      }else {
        return this.accountId !== ''
      }
    },
  },
  methods: {
    getPayCounts() {
      this.isLoadingAccount = true
      this.$axios.get('v1/pay/accounts')
        .then(resp => resp.data)
        .then((res) => {
          this.accountOptions = res.data
          this.isLoadingAccount = false
        })
    },
    selectVisibleChange(visible) {
      if (visible && this.accountOptions.length === 0) {
        this.getPayCounts()
      }
    },
    // 支付结果处理
    payResultHandler(result) {
      var statusMsg = ''
      switch (this.params.payType) {
        // 交易
        case 'transaction': statusMsg = '支付'; break;
        // 保证金支付
        case 'escrowExceed': statusMsg = '保证金支付'; break;
        // 保证金没收
        case 'escrowConfiscated': statusMsg = '保证金没收'; break;
        // 保证金赎回
        case 'escrowConfiscated': statusMsg = '保证金赎回'; break;
      }

      switch (result.status) {
        case 1:
          Message.success(`${statusMsg}进行中，稍后查询结果`)
          break
        case 2:
          Message.success(`${statusMsg}成功`)
          break
        case 3:
          Message.success(`${statusMsg}失败`)
          break
        default:
          Message.info(`未知的支付状态`)
      }
    },
    // 支付完成（即支付成功） 处理
    doneHandler(data) {
      if (this.order) {
        data = {
          shouldUpdate: true
        }
      }
      this.$emit('close', data)
    },
    checkOrderStatus(order) {
      if (!order) return

      this.order = order
      let msg
      switch (order.status) {
        case 1:
          msg = '支付进行中'
          break
        case 2:
          msg = '已支付成功'
          break
        case 3:
          msg = '支付失败'
          break
      }

      this.tipMsg = msg
    },
    // 点击确认
    sure() {
      var promise = null
      var { contractId, eventId, accountId, targAount, password } = this
      switch (this.payType) {
        // 交易
        case 'transaction': {}
        // 保证金支付
        case 'escrowExceed': {
          promise = this.$axios.post('/v1/contracts/events/payment', {
            contractId,
            eventId,
            fromAccountId: accountId,
            amount: targAount,
            password: password
          })
          break
        }
        // 没收保证金
        case 'escrowConfiscated': {
          this.$axios.post('/v1/contracts/events/escrowConfiscated', {
            contractId,
            eventId,
            toAccountId: accountId,
          })
          break
        }
        // 赎回保证金
        case 'escrowConfiscated': {
          this.$axios.post('/v1/contracts/events/escrowRefunded', {
            contractId,
            eventId,
            toAccountId: accountId,
          })
          break
        }
      }

      if(promise !== null) {
        promise
          .then(resp => resp.data)
          .then((res) => {
            if (res.errcode === 0) {
              this.payResultHandler(res.data)
              this.doneHandler({ shouldUpdate: true, data: res.data })
            } else {
              Message.error(res.msg)
            }
          })
          .catch(e => Message.error(e))
      }

    },
    mounted() {
      this.getPayCounts()
      // this.queryOrder().then(this.checkOrderStatus.bind(this))
    },
  }
}
