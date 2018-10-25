<template>
  <div class="contract-detail-content-wrapper" v-html="contractDetail" @click="handlerProxy">

  </div>
</template>

<script>
  import { highlight } from '@freelog/resource-policy-lang'

  export default {
    name: 'contract-detail',
    props: {
      contract: {
        type: Object,
        required: true
      }
    },
    data() {
      return {

      }
    },
    computed: {
      contractId() {
        return this.contract.contractId
      },
      fsmStates() {
        return this.contract.contractClause.fsmStates
      },
      currentFsmState() {
        return this.contract.contractClause.currentFsmState
      },
      policyText() {
        return this.contract.contractClause.policyText
      },
      contractDetail() {
        return highlight(this.policyText)
      }
    },
    methods: {
      toggleClass($dom, className) {
        const curClassName = $dom.className
        if (curClassName.indexOf(className) !== -1) {
          $dom.className = curClassName.replace(className, '')
        } else {
          $dom.className = `${curClassName} ${className}`
        }
      },
      highlightCurrentState(state) {
        if (this.currentFsmState !== 'none') {
          const $currentDom = this.$el.querySelector('.bp-state.active')
          const $targDom = this.$el.querySelector(`.bp-s-${state || this.currentFsmState}`)
          $currentDom && this.toggleClass($currentDom, 'active')
          $targDom && this.toggleClass($targDom, 'active')
        }
      },
      handlerProxy(event) {
        const dataset = event.target.dataset
        const handlerName = dataset.handler
        if (this[handlerName]) {
          const transitionData = this.getStateTransitionData(dataset.transition)
          if (transitionData !== null) {
            const { code, params, eventId } = transitionData
            this[handlerName](code, params, eventId)
          }
        }
      },
      getStateTransitionData(transition) {
        if (this.fsmStates[this.currentFsmState]) {
          const transitionMap = this.fsmStates[this.currentFsmState].transition
          return transitionMap[transition]
        }
        return null
      },
      // 签约协议
      signingEvent(code, params, eventId) {
        console.log('run escrowExceedAmount - code, params, eventId --', code, params, eventId)
        const options = Object.assign({}, params, {
          type: 'signing',
          eventId,
          licenseIds: params.licenseResourceId,
          contractId: this.contractId
        })
        this.$emit('execute', options)
      },
      cycleEndEvent(code, params, eventId) {},
      // 交易事件
      transactionEvent(code, params, eventId) {
        const options = Object.assign({}, params, {
          type: 'transaction',
          payType: 'transaction',
          eventId,
          amount: params.amount.literal,
          contractId: this.contractId
        })
        this.$emit('execute', options)
      },
      settlementEvent(code, params, eventId) {},
      viewCountEvent(code, params, eventId) {},
      recontractCountEvent(code, params, eventId) {},
      presentCountEvent(code, params, eventId) {},
      // 收取保证金 - 弹窗 - 支付
      escrowExceedAmount(code, params, eventId) {
        console.log('run escrowExceedAmount - code, params, eventId --', code, params, eventId)

        const options = Object.assign({}, params, {
          type: 'transaction',
          payType: 'escrowExceedAmount',
          eventId,
          amount: params.amount.literal,
          contractId: this.contractId
        })
        this.$emit('execute', options)
      },
      // 保证金没收
      escrowConfiscated(code, params, eventId) {
        const options = Object.assign({}, params, {
          type: 'escrowConfiscated',
          eventId,
          contractId: this.contractId
        })
        this.$emit('execute', options)
      },
      // 保证金赎回
      escrowRefunded(code, params, eventId) {
        this.$confirm('是否确定赎回保证金？')
          .then(() => {
            this.$axios.post('/v1/contracts/events/escrowRefunded', {
              contractId: this.contractId,
              eventId,
            })
              .then((resp) => {
                if (resp.status === 200) {
                  if (resp.data.errcode === 0) {
                    this.$emit('execute', {
                      payType: 'escrowConfiscated',
                      contractId: this.contractId,
                      eventId
                    })
                    console.log('Escrow has been refunded success!')
                  } else {
                    console.log(`Escrow has been refunded fail! error: ${resp.data.msg}`)
                  }
                } else {
                  console.log('/v1/contracts/events/escrowRefunded 请求失败！')
                }
              })
              .catch((e) => {

              })
          })
      },
      cycleEndEvent(code, params, eventId) {},

      customEvent(code, params, eventId) {

      },

    },
    mounted() {
      this.highlightCurrentState()
    },
    updated() {
      this.highlightCurrentState()
    }
  }
</script>

<style lang="less" type="text/less">

  // policy 高亮
  .beauty-poliycy-box{
    min-width: 200px;
    display: inline-block;
    font-size: 14px; line-height: 1.6;
    color: #999;
    overflow: hidden;

    .bp-audience{ }
    .bp-declaration, .bp-state, .bp-s-row:not(:first-child){
      padding-left: 1em;
    }



    .bp-state.active{
      margin-bottom: 5px; padding-right: 1em;
      border: 1px solid #B3D7FF; border-radius: 20px;
      color: #222; background: #E3F0FF;
    }
    .bp-state.active .bp-s-transition{
      color: #EE6723;
    }

    .bp-state .bp-s-event{
      pointer-events: none;
    }
    .bp-state.active .bp-s-event{
      display: inline-block; cursor: pointer; color: #3e94f3; pointer-events: auto;
    }
  }


</style>

