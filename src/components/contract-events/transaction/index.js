import ACCOUNT_CONFIG from '../../../config/account-types'
import { Alert, Form, FormItem, Select, Tooltip, Button, Input, Option, Message } from 'element-ui'


export default {
  name: 'transaction-event',
  data() {
    return {
      options: [],
      fromAccountId: '',
      password: '',
      tipMsg: '',
      order: {},
      showError: false,
      isLoadingAccount: false,
    }
  },
  components: {
    "el-lert": Alert,
    "el-form": Form,
    "el-form-item": FormItem,
    "el-select": Select,
    "el-tooltip": Tooltip,
    "el-button": Button,
    "el-input": Input,
    "el-option": Option
  },
  mounted() {
    const self = this
    this.$axios.get('v1/pay/accounts')
      .then((res) => {
        self.options = res.data.data
      })
    // this.queryOrder().then(this.checkOrderStatus.bind(this))
  },
  computed: {
    unitType() {
      return this.params.currencyUnit
    },
    amount() {
      switch (this.unitType) {
        case 'feather': {
          return parseInt(+this.params.amount * 1000)
        }
      }
    }
  },
  props: ['contractDetail', 'params'],
  methods: {
    selectVisibleChange(visible) {
      if (visible && this.options.length === 0) {
        this.isLoadingAccount = true
        this.$services.accounts.get()
          .then((res) => {
            this.options = res.data.data
            this.isLoadingAccount = false
          })
      }
    },
    // 支付结果处理
    payResultHandler(result) {
      switch (result.status) {
        case 1:
          Message.success('支付进行中，稍后查询支付结果')
          break
        case 2:
          Message.success('支付成功')
          break
        case 3:
          Message.success('支付失败')
          break
        default:
          Message.info('未知的支付状态')
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
    // 查询支付订单状态
    queryOrder() {
      // return this.$services.orderInfo.get({
      //   params: {
      //     targetId: this.contractDetail.contractId
      //   }
      // }).then((res) => {
      //   return res.getData()
      // })
    },
    // 支付
    pay() {
      const self = this
      let promise = null
      switch (this.params.payType) {
        // 保证金支付
        case 'escrowExceedAmount': {
          promise = this.$axios.post('/v1/contracts/events/payment', {
            contractId: this.params.contractId,
            eventId: this.params.eventId,
            fromAccountId: this.fromAccountId,
            amount: this.amount,
            password: this.password
          })
          break
        }
        default: {}
      }

      if (promise !== null) {
        promise
          .then((res) => {
            console.log('res ---', res)
            if (res.data.errcode === 0) {
              this.showError = false
              this.payResultHandler(res.data.data)
              this.doneHandler({ shouldUpdate: true, data: res.data.data })
            } else {
              this.showError = true
              Message.error(res.data.msg)
            }
          })
          .catch((e) => {
            this.$error.showErrorMessage(e)
          })
      } else {
        console.error(`payType(${payType}) is wrong!`)
      }
    }
  }
}
