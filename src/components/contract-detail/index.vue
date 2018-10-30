<template>
  <div class="contract-detail-content-wrapper" >
    <div
            v-if="contract.status === 2"
            v-html="contractDetail"
            @click="handlerProxy"
    ></div>
    <pre class="policy-text" v-else>{{beautifulPolityText}}</pre>

    <el-dialog
            :title="modalTitle"
            ref="eventDialog"
            :visible.sync="showEventExecDialog"
            :before-close="closeDialogHandler"
            append-to-body
            :center=true
            width="475px"
    >
      <component
              :is="eventComponent"
              :contractDetail="contract"
              @close="closeDialogHandler"
              :params="targetContractEvent"
      ></component>
    </el-dialog>
  </div>
</template>

<script>
  import { highlight, beautify } from '@freelog/resource-policy-lang'
  import {
    LicenseEvent,
    TransactionEvent,
    EscrowConfiscate,
    eventComponentMap
  } from '../contract-events/index'

  export default {
    name: 'contract-detail',
    props: {
      contract: {
        type: Object,
        required: true
      }
    },
    components: {
      TransactionEvent, LicenseEvent, EscrowConfiscate,
    },
    data() {
      return {
        modalTitle: '',
        eventComponent: '',
        showEventExecDialog: false,
        targetContractEvent: {}
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
      beautifulPolityText() {
        return beautify(this.policyText)
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
      // 合同事件处理 执行合同
      executeContractHandler(params) {
        console.log('params --', params, eventComponentMap[params.type])
        switch (params.type) {
          case 'escrowConfiscated':
          case 'signingEvent':
          case 'transactionEvent': {
            const eventComConfig = eventComponentMap[params.type]
            this.targetContractEvent = params
            this.eventComponent = eventComConfig.type
            this.modalTitle = eventComConfig.title
            this.showEventExecDialog = true
            break
          }
          default: {
            // this.updateContractDetail()
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
        const options = Object.assign({}, params, {
          type: 'signingEvent',
          eventId,
          licenseIds: params.licenseResourceId,
          contractId: this.contractId
        })
        this.executeContractHandler(options)
      },
      cycleEndEvent(code, params, eventId) {},
      // 交易事件
      transactionEvent(code, params, eventId) {
        const options = Object.assign({}, params, {
          type: 'transactionEvent',
          payType: 'transaction',
          eventId,
          amount: params.amount.literal,
          contractId: this.contractId
        })
        this.executeContractHandler(options)
      },
      settlementEvent(code, params, eventId) {},
      viewCountEvent(code, params, eventId) {},
      recontractCountEvent(code, params, eventId) {},
      presentCountEvent(code, params, eventId) {},
      // 收取保证金 - 弹窗 - 支付
      escrowExceedAmount(code, params, eventId) {

        const options = Object.assign({}, params, {
          type: 'transactionEvent',
          payType: 'escrowExceedAmount',
          eventId,
          amount: params.amount.literal,
          contractId: this.contractId
        })
        this.executeContractHandler(options)
      },
      // 保证金没收
      escrowConfiscated(code, params, eventId) {
        const options = Object.assign({}, params, {
          type: 'escrowConfiscated',
          eventId,
          contractId: this.contractId
        })
        this.executeContractHandler(options)
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
      closeDialogHandler({ shouldUpdate }) {
        this.showEventExecDialog = false
        if(shouldUpdate) {
          this.$emit('update-contract', { shouldUpdate })
        }
      }
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

