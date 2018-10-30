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
      <div class="rcb-contract-record" :class="{'disabled': !isHasContractRecord, 'opened': isOpenContractRecordBox}" @click="toggleContractRecordBox"></div>
    </div>
    <div class="rcb-tab-pane">
      <div class="rcb-tp-contract-content">
        <contract-detail
                v-if="actPolicy.contractState.type === 'inactive'"
                :contract="selectedContract"
                @execute="executeContractHandler">
        </contract-detail>
        <pre class="policy-text" v-else>{{actBeautifulPolityText}}</pre>
        <fe-dialog
                :title="modalTitle"
                title-text-align="center"
                ref="eventDialog"
                :visible.sync="showEventExecModal"
                :before-close="closeModalHandler"
                append-to-body
                :center=true
                width="475px"
        >
          <component
                  :is="eventComponent"
                  :contractDetail="selectedContract"
                  @close="closeModalHandler"
                  :params="selectedContractEvent"
          ></component>
        </fe-dialog>
      </div>
      <div class="rcb-tp-status-bar">
        {{actPolicy.contractState && actPolicy.contractState.info}}
        <div class="rcb-tp-sb-btn-box" v-if="actPolicy.contractState.type != 'nosign'">
          <button class="rcb-tp-sb-default" v-if="isSelectedContractDefault"  @click="showSetDefaultContractComfrim">默认合约</button>
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
              <td>{{item.contractName}}</td>
              <td>{{new Date(item.updateDate).toLocaleString()}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="rcb-remark" v-if="actPolicy.contractState.type !== 'nosign'">
      <div class="rcb-r-left">
        <span v-if="targRemark === ''" class="rcb-add-remark" id="rcb-remak" @click="addRemark">添加备注 <i
                class="el-icon-plus"></i> </span>
        <span v-else  @click="addRemark">备注 <i class="el-icon-edit-outline"></i></span>
      </div>
      <div class="rcb-r-right">
        <textarea v-if="isAddRemark" name="rcb-remak" id="" v-model="targRemark"
                  rows="3" @blur="updateRemark"></textarea>
        <div v-else>{{targRemark}}</div>
      </div>
    </div>
    <div class="rcb-footer">
      <!--<button class="btn-normal btn-cancel" @click="cancelSign">取消</button>-->
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
  import { Message, Loading } from 'element-ui'
  import { beautify } from '@freelog/resource-policy-lang'
  import FeDialog from '../fe-dialog/fe-dialog.vue'
  import FeToast from '../freelog-toast/freelog-toast'
  import ContractConfirm from './confirm.vue'
  import ContractDetail from '../contract-detail/index'

  import {
    getContractState,
  } from './common.js'
  import {
    LicenseEvent,
    TransactionEvent,
    EscrowConfiscate,
    eventComponentMap
  } from '../contract-events/index'

  export default {
    components: {
      FeDialog, FeToast, ContractConfirm, ContractDetail, TransactionEvent, LicenseEvent, EscrowConfiscate,
    },
    props: {
      presentable: {
        type: Object
      },
      resourceIdContractsMap: {
        type: Object
      },
      DCPolicyIndex: {
        type: Number
      },
    },
    data() {
      return {
        selectedContract: null,
        confirmType: '',
        resourceIntro: '',
        actPolicyIndex: 0,
        isShowConfirm: false,
        isActPolicyDefault: false,
        isAddRemark: false,
        isOpenContractRecordBox: false,
        showEventExecModal: false,
        isShowToast: false,
        selectedContractEvent: '',
        eventComponent: '',
        modalTitle: '',
        isUpdateView: 1,
        toastMsg: '',
        recordBoxLoading: null,
        contractRecords: [],
        targRemark: ''
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
          policy.contractState = getContractState(contract)
        })
      },
      exchangePolicy(index) {
        this.actPolicyIndex = index
        console.log('run exchangePolicy --', index)
        this.exchangeContract()
      },
      exchangeContract() {
        var contract = null
        const contractMap = this.resourceIdContractsMap[this.actPolicy.resourceId]
        if(contractMap) {
          contract = contractMap[this.actPolicy.segmentId]
          if (contract) {
            contract.partyOneInfo = {
              nodeName: this.presentable.nodeName,
              ownerUserId: this.presentable.userId
            }
          }
        }
        console.log('run exchangeContract --',contract)

        this.selectedContract = contract
        this.targRemark = this.selectedContract.remark
      },
      exchangeDefaultContract() {
        const contractMap = this.resourceIdContractsMap[this.actPolicy.resourceId]
        if(contractMap) {
          for(let segmentId in contractMap) {
              contractMap[segmentId].isDefault = this.actPolicy.segmentId === segmentId ? 1 : 0
          }
        }
      },
      addRemark() {
        this.isAddRemark = true
      },
      // 关闭对话框
      closeModalHandler({ shouldUpdate }) {
        this.showEventExecModal = false
        if(shouldUpdate) {
          this.queryContractState(this.selectedContract.contractId)
        }
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
        this.$emit('cancel')
      },
      // 执行合同签约
      signContract(isSetDefault) {
        const {presentableId} = this.presentable
        const {segmentId} = this.actPolicy
        const isDefault = isSetDefault ? 1 : 0

        this.$axios({
          url: '/v1/contracts/createUserPresentableContract',
          method: 'POST',
          data: {
            presentableId,
            segmentId,
            targetId: presentableId,
            isDefault
          }
        })
          .then(res => res.data)
          .then((res) => {
            if (res.errcode === 0) {
              const contract = res.data
              this.showToast('签约中...')
              this.queryContractState(contract.contractId)
            } else {
              throw new Error(res.msg)
            }
          })
          .catch((e) => {
            Message({
              type: 'error',
              showClose: true,
              message: '签约失败，稍后再试！！！' + e
            })
          })
      },
      // 执行合同后：由于合同事件为异步的，须再次查询、确认合同状态
      queryContractState(contractId) {
        this.timer = setTimeout(() => {
          this.$axios({ url: `/v1/contracts/${contractId}` })
            .then(res => res.data)
            .then(res => {
              const contract = res.data
              this.$emit('refresh-contract', contract)
              this.exchangeContract()
              if(contract.isDefault === 1) {
                this.exchangeDefaultContract()
                this.$emit('update:DCPolicyIndex', this.actPolicyIndex)
              }

              this.hideToast()
            })
            .catch(e => {
              this.hideToast()
            })
        }, 5e2)

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
              this.exchangeDefaultContract()
              if(this.DC_policyIndex !== this.actPolicyIndex) {
                this.$emit('update:DCPolicyIndex', this.actPolicyIndex)
              }else {
                this.$emit('refresh-contract')
              }
              this.$forceUpdate()
            } else {
              throw new Error()
            }
          })
          .catch(() => {
            Message({
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
      confirmCancel() {
        this.isShowConfirm = false
      },
      confirmSure({isSetDefault}) {
        this.isShowConfirm = false
        switch (this.confirmType) {
          case 'set-default-contract': {
            this.setDefualtContract()
            break
          }
          case 'sign-contract': {
            this.signContract(isSetDefault)
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
      toggleContractRecordBox() {
        this.isOpenContractRecordBox = !this.isOpenContractRecordBox
      },
      showToast(msg) {
        this.isShowToast = true
        this.toastMsg = msg
      },
      hideToast() {
        this.isShowToast = false
      },
      getContractRecords() {
        this.$axios.get(`/v1/contracts/terminateContracts?partyTwo=${this.userId}&targetId=${this.presentableId}`)
          .then(res => res.data)
          .then(res => {
            if(res.errcode === 0) {
              this.contractRecords = res.data
            }else {
              this.contractRecords = []
            }
          })
      },
      updateRemark(event) {
        var remark = event.target.value
        this.$axios.put(`/v1/contracts/${this.selectedContract.contractId}`,{
          remark
        })
          .then(res => res.data)
          .then(res => {
            if(res.errcode === 0) {
              this.targRemark = remark
              this.isAddRemark = false
            }
          })
      }
    },
    computed: {
      isSelectedContractDefault() {
        return this.selectedContract && this.selectedContract.isDefault === 1
      },
      isHasContractRecord() {
        return this.contractRecords.length !== 0
      },
      actPolicy() {
        const policy = this.policyList[this.actPolicyIndex]
        return policy
      },
      resourceId() {
        return this.presentable.resourceId
      },
      presentableId() {
        return this.presentable.presentableId
      },
      userId() {
        return this.presentable.userId
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
      actBeautifulPolityText() {
        return beautify(this.actPolicy.policyText)
      },
    },
    watch: {
      presentable(newV, oldV) {
        this.actPolicyIndex = this.DCPolicyIndex
        this.exchangeContract()
        this.getContractRecords()
      },
    },
    beforeUpdate() {
      this.resolvePolicyContractStateMap()
    },
    beforeMount() {
      this.actPolicyIndex = this.DCPolicyIndex
      this.resolvePolicyContractStateMap()
      this.exchangeContract()
      this.getContractRecords()
    },
    destroyed() {
      clearTimeout(this.timer)
    }
  }
</script>

<style lang="less" scoped type="text/less">
  @import './signing-box.less';
</style>

