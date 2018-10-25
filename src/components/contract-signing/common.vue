<template>
  <div class="resource-contract-box">
    <div class="rcb-id-box">
      <label class="rcb-name">资源ID</label>
      <div class="rcb-value">{{resourceId}}</div>
    </div>
    <div class="rcb-type-box">
      <label class="rcb-name">资源类型</label>
      <div class="rcb-value">{{resourceType}}</div>
    </div>
    <div class="rcb-intro-box" v-if="false">
      <label class="rcb-name">资源描述</label>
      <div class="rcb-value">{{resourceIntro}}</div>
    </div>
    <div class="rcb-tab-box">
      <ul>
        <li
                class="rcb-tab-item"
                :class="{'active': index === actPolicyIndex}"
                v-for="(item, index) in policyList"
                :key="'rc-tab-'+(index+1)"
                @click="exchangePolicy(index)"
        >{{item.policyName + (item.contractState.type !== 'nosign' ? '(已签约)': '')}}
        </li>
      </ul>
      <div class="rcb-contract-record" :class="{'disabled': !isHasContractRecord}" @click="toggleContractRecordBox"></div>
    </div>
    <div class="rcb-tab-pane">
      <div class="rcb-tp-contract-content">
        <contract-detail
                v-if="actPolicy.contractState.type === 'inactive' && isShowContractContent"
                :contract="selectedContract"
                @execute="executeContractHandler">
        </contract-detail>
        <pre class="policy-text" v-else>{{actBeautifulPolityText}}</pre>
        <!--<fe-dialog-->
                <!--:title="modalTitle"-->
                <!--ref="eventDialog"-->
                <!--:visible.sync="showEventExecModal"-->
                <!--:before-close="closeModalHandler"-->
                <!--append-to-body-->
                <!--:center=true-->
                <!--width="40%"-->
        <!--&gt;-->
          <!--<TransactionEvent v-if="showEventExecModal"></TransactionEvent>-->
          <!--<component-->
                  <!--:is="eventComponent"-->
                  <!--:contractDetail="selectedContract"-->
                  <!--@close="closeModalHandler"-->
                  <!--:params="selectedContractEvent"-->
          <!--&gt;</component>-->
        <!--</fe-dialog>-->
        <TransactionEvent v-if="showEventExecModal"></TransactionEvent>
      </div>
      <div class="rcb-tp-status-bar">
        {{actPolicy.contractState && actPolicy.contractState.info}}
        <div class="rcb-tp-sb-btn-box" v-if="actPolicy.contractState.type != 'nosign'">
          <button class="rcb-tp-sb-default" v-if="selectedContract.isDefault === 1">默认合约</button>
          <button class="rcb-tp-sb-set-default" v-else @click="showSetDefaultContractComfrim">设为默认</button>
        </div>
      </div>
      <div class="rcb-tp-contract-record" :class="{'opened': isOpenContractRecordBox}">
        <table>
          <thead>
            <tr>
              <th>合约ID</th>
              <th>策略名称</th>
              <th>签约时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in contractRecords" :key="'record-'+index">
              <td>{{item.contractId}}</td>
              <td>{{item.policyName}}</td>
              <td>{{item.signDate}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="rcb-remark">
      <div class="rcb-r-left">
        <span v-if="actPolicy.contractState.type === 'nosign'" class="rcb-add-remark" id="rcb-remak" @click="addRemark">添加备注 <i
                class="el-icon-plus"></i> </span>
        <span v-else>备注 <i class="el-icon-edit-outline"></i></span>
      </div>
      <div class="rcb-r-right">
        <div v-if="actPolicy.contractState.type != 'nosign'">{{targRemark}}</div>
        <textarea v-if="actPolicy.contractState.type === 'nosign' && isAddRemark" name="rcb-remak" id=""
                  rows="3"></textarea>
      </div>
    </div>
    <div class="rcb-footer">
      <button class="btn-normal btn-cancel" @click="cancelSign">取消</button>
      <button type="button" class="btn-normal btn-sign" :class="{'disabled': this.actPolicy && this.actPolicy.contractState.type !== 'nosign'}" @click="showSignConfirm">
        签约
      </button>
    </div>

    <contract-confirm
            :visible.sync="isShowConfirm"
            :presentableName="presentableName"
            :policyName="actPolicy.policyName"
            :confirmType="confirmType"
            @cancel="confirmCancel"
            @sure="confirmSure">
    </contract-confirm>
    <fe-toast :visible.sync="isShowToast" :msg="toastMsg" :isAutoHide="false"></fe-toast>
  </div>
</template>

<script>
  import { beautify } from '@freelog/resource-policy-lang'
  import FeDialog from '../fe-dialog/fe-dialog.vue'
  import FeToast from '../freelog-toast/freelog-toast'
  import ContractConfirm from './confirm.vue'
  import ContractDetail from '../contract-detail/index'

  import TransactionEvent from '../contract-events/transaction/index'
  import {
    LicenseEvent,
    // TransactionEvent,
    EscrowConfiscate,
    eventComponentMap
  } from '../contract-events/index'

  let userinfos = null
  export default {
    props: {
      presentable: {
        type: Object
      },
      resourceIdContractsMap: {
        type: Object
      },
      getContractState: {
        type: Function,
      }
    },
    data() {
      return {
        isShowConfirm: false,
        confirmType: '',
        resourceIntro: '',
        actPolicyIndex: 0,
        isActPolicyDefault: false,
        isAddRemark: false,
        selectedContractEvent: '',
        eventComponent: '',
        modalTitle: '',
        showEventExecModal: false,
        userinfos: {},
        isShowContractContent: false,
        isUpdateView: 1,
        isOpenContractRecordBox: false,
        toastMsg: '',
        isShowToast: false
      }
    },
    methods: {
      // 处理策略与合同状态的关系
      resolvePolicyContractStateMap() {
        this.policyList.forEach((policy) => {
          const contractMap = this.resourceIdContractsMap[policy.resourceId]

          var contract = null
          if(contractMap) {
            contract = contractMap[policy.segmentId] || null
          }
          policy.contractState = this.getContractState(contract)
        })
      },
      exchangePolicy(index) {
        this.actPolicyIndex = index
      },
      addRemark() {
        this.isAddRemark = true
      },
      // 关闭对话框
      closeModalHandler() {
        this.showEventExecModal = false
      },

      // 合同事件处理 执行合同
      executeContractHandler(params) {
        console.log('params --', params, eventComponentMap[params.type])
        switch (params.type) {
          case 'escrowConfiscated':
          case 'signing':
          case 'transaction': {
            const eventComConfig = eventComponentMap[params.type]
            this.selectedContractEvent = params
            this.eventComponent = eventComConfig.type
            this.modalTitle = eventComConfig.title
            this.showEventExecModal = true
            break
          }
          default: {
            // this.updateContractDetail()
          }
        }
      },
      // 取消签约并关闭对话框
      cancelSign() {
        this.$emit('cancel-sign')
      },
      // 执行合同签约
      signContract() {
        const {presentableId} = this.presentable
        const {segmentId} = this.actPolicy

        this.$axios({
          url: '/v1/contracts/createUserPresentableContract',
          method: 'POST',
          data: {
            presentableId,
            segmentId,
            targetId: presentableId,
            isDefault: 1
          }
        })
          .then(res => res.data)
          .then((res) => {
            if (res.errcode === 0) {
              const contract = res.data
              this.showToast('签约中...')
              setTimeout(() => {
                this.queryContractState(contract.contractId)
              }, 5e2)
            } else {
              throw new Error()
            }
          })
          .catch(() => {
            this.$message({
              type: 'error',
              showClose: true,
              message: '签约失败，稍后再试！！！'
            })
          })
      },
      // 签约后：由于签约事件为异步的，须再次查询、确认合同状态
      queryContractState(contractId) {
        this.$axios({ url: `/v1/contracts/${contractId}` })
          .then(res => res.data)
          .then(res => {
            const contract = res.data

            const obj = this.resourceIdContractsMap[contract.resourceId] || {}
            obj[contract.segmentId] = contract
            this.resourceIdContractsMap[contract.resourceId] = obj
            // 更新policy与contract的映射关系后，强制刷新
            this.$forceUpdate()
            this.$emit('refresh-contract')
            this.resolvePolicyContractStateMap()
            this.hideToast()
          })
      },
      // 设置默认合同
      setDefualtContract() {
        this.$axios({
          url: `/v1/contracts/setDefault?contractId=${this.selectedContract.contractId}`,
          method: 'PUT',
        })
          .then(res => res.data)
          .then((res) => {
            if (res.errcode === 0) {
              this.isActPolicyDefault = true
            } else {
              throw new Error()
            }
          })
          .catch(() => {
            this.$message({
              type: 'error',
              showClose: true,
              message: '设置默认合同失败，稍后再试！！！'
            })
          })
      },
      // 显示confirm 弹窗
      showConfirm(type) {
        this.isShowConfirm = true
        this.confirmType = type
      },
      toggleContractRecordBox() {
        this.isOpenContractRecordBox = !this.isOpenContractRecordBox
      },
      confirmCancel() {
        this.isShowConfirm = false
      },
      confirmSure() {
        this.isShowConfirm = false
        switch (this.confirmType) {
          case 'set-default-contract': {
            this.setDefualtContract()
            break
          }
          case 'sign-contract': {
            this.signContract()
            break
          }
        }
      },
      showSetDefaultContractComfrim() {
        this.showConfirm('set-default-contract')
      },
      showSignConfirm() {
        this.showConfirm('sign-contract')
      },
      showToast(msg) {
        this.isShowToast = true
        this.toastMsg = msg
      },
      hideToast() {
        this.isShowToast = false
      },

    },
    computed: {
      isHasContractRecord() {
        return false
      },
      contractRecords() {
        return [
          { contractId: '2345ythdnhfgkto87jhddfbg', policyName: '授权策略1', signDate: '2018-09-10 12:00' },
          { contractId: '2345yfsfsfsffso87jhddfbg', policyName: '授权策略2', signDate: '2018-09-10 12:00' },
        ]
      },
      actPolicy() {
        const policy = this.policyList[this.actPolicyIndex]
        return policy
      },
      resourceId() {
        return this.presentable.resourceId
      },
      resourceType() {
        return this.presentable.resourceInfo.resourceType
      },
      // 节点资源名称
      presentableName() {
        return this.presentable.presentableName
      },
      policyList() {
        const { resourceId } = this.presentable
        return this.presentable.policy.map(item => {
          item.resourceId = resourceId
          return item
        })
      },
      selectedContract() {
        var contract = null
        const contractMap = this.resourceIdContractsMap[this.actPolicy.resourceId]
        if(contractMap) {
          contract = contractMap[this.actPolicy.segmentId]
          if (contract) {
            contract.partyOneInfo = {
              nodeName: this.presentable.nodeName,
              ownerUserId: this.presentable.userId
            }
            contract.partyTwoInfo = userinfos
          }
        }

        return contract
      },
      actBeautifulPolityText() {
        return beautify(this.actPolicy.policyText)
      },
      targRemark() {
        return ''
      }
    },
    components: {
      FeDialog, FeToast, ContractConfirm, ContractDetail, TransactionEvent, LicenseEvent, EscrowConfiscate
    },
    beforeMount() {
      this.resolvePolicyContractStateMap()
      if (userinfos === null) {
        this.$axios.get(`/v1/userinfos/current`)
          .then(res => res.data)
          .then((res) => {
            if (res.errcode === 0) {
              userinfos = res.data
              this.isShowContractContent = true
            }
          })
      } else {
        this.isShowContractContent = true
      }
    }
  }
</script>

<style lang="less" scoped type="text/less">
  @import './common.less';
</style>

