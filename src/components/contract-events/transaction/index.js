// import ACCOUNT_CONFIG from '../../../config/account-types'


//
// export default {
//   name: 'transaction-event',
//   data() {
//     return {
//       options: [],
//       fromAccountId: '',
//       password: '',
//       tipMsg: '',
//       order: {},
//       showError: false,
//       isLoadingAccount: false,
//     }
//   },
//   // components: {
//   //   ElAlert, ElForm, ElFormItem, ElSelect, ElTooltip, ElButton
//   // },
//   mounted() {
//     const self = this
//     this.$axios.get('v1/pay/accounts')
//       .then((res) => {
//         self.options = res.data.data
//       })
//     // this.$services.accounts.get('').then((res) => {
//     //   self.options = res.data.data
//     // })
//     // this.queryOrder().then(this.checkOrderStatus.bind(this))
//   },
//   computed: {
//     unitType() {
//       return this.params.currencyUnit
//     }
//   },
//   props: ['contractDetail', 'params'],
//   methods: {
//     selectVisibleChange(visible) {
//       if (visible && this.options.length === 0) {
//         this.isLoadingAccount = true
//         this.$services.accounts.get()
//           .then((res) => {
//             this.options = res.data.data
//             this.isLoadingAccount = false
//           })
//       }
//     },
//     // 支付结果处理
//     payResultHandler(result) {
//       switch (result.status) {
//         case 1:
//           this.$message.success('支付进行中，稍后查询支付结果')
//           break
//         case 2:
//           this.$message.success('支付成功')
//           break
//         case 3:
//           this.$message.success('支付失败')
//           break
//         default:
//           this.$message.info('未知的支付状态')
//       }
//     },
//     // 支付完成（即支付成功） 处理
//     doneHandler(data) {
//       if (this.order) {
//         data = {
//           shouldUpdate: true
//         }
//       }
//       this.$emit('close', data)
//     },
//     checkOrderStatus(order) {
//       if (!order) return
//
//       this.order = order
//       let msg
//       switch (order.status) {
//         case 1:
//           msg = '支付进行中'
//           break
//         case 2:
//           msg = '已支付成功'
//           break
//         case 3:
//           msg = '支付失败'
//           break
//       }
//
//       this.tipMsg = msg
//     },
//     // 查询支付订单状态
//     queryOrder() {
//       // return this.$services.orderInfo.get({
//       //   params: {
//       //     targetId: this.contractDetail.contractId
//       //   }
//       // }).then((res) => {
//       //   return res.getData()
//       // })
//     },
//     // 支付
//     pay() {
//       const self = this
//       let promise = null
//       switch (this.params.payType) {
//         // 保证金支付
//         case 'escrowExceedAmount': {
//           promise = this.$axios.post('/v1/contracts/events/payment', {
//             contractId: this.params.contractId,
//             eventId: this.params.eventId,
//             fromAccountId: this.fromAccountId,
//             amount: +this.params.amount,
//             password: this.password
//           })
//           break
//         }
//         default: {}
//       }
//
//       if (promise !== null) {
//         promise
//           .then((res) => {
//             console.log('res ---', res)
//             if (res.data.errcode === 0) {
//               this.showError = false
//               this.payResultHandler(res.data.data)
//               this.doneHandler({ shouldUpdate: true, data: res.data.data })
//             } else {
//               this.showError = true
//               this.$message.error(res.data.msg)
//             }
//           })
//           .catch((e) => {
//             this.$error.showErrorMessage(e)
//           })
//       } else {
//         console.error(`payType(${payType}) is wrong!`)
//       }
//     }
//   }
// }
