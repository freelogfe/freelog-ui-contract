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
      <ul :class="{'disabled': isOpenContractRecordBox}">
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
                :contract="selectedContract"
                @update-contract="closeModalHandler">
        </contract-detail>
      </div>
      <div class="rcb-tp-status-bar">
        {{actPolicy.contractState && actPolicy.contractState.info}}
        <div class="rcb-tp-sb-btn-box" v-if="actPolicy.contractState.type != 'nosign'">
          <button class="rcb-tp-sb-default" v-if="isSelectedContractDefault">默认合约</button>
          <button class="rcb-tp-sb-set-default" v-else @click="showConfirm('set-default-contract')">设为默认</button>
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
        <span
          v-if="currentRemark === ''"
          class="rcb-add-remark"
          id="rcb-remak"
          @click="toggleEditRemark('add')"
        > 添加备注 <i class="el-icon-plus"></i></span>
        <span v-else  @click="toggleEditRemark('update')"> 备注 <i class="el-icon-edit-outline"></i></span>
      </div>
      <div class="rcb-r-right">
        <textarea
                v-if="isEditRemark"
                name="rcb-remak"
                v-model="targetRemark"
                rows="3"
                @blur="updateRemark">
        </textarea>
        <div v-else>{{targetRemark}}</div>
      </div>
    </div>
    <div class="rcb-footer">
      <button type="button"
              class="btn-normal btn-sign"
              :class="{'disabled': this.actPolicy && this.actPolicy.contractState.type !== 'nosign'}"
              @click="showConfirm('sign-contract')">签约
      </button>
    </div>

    <contract-confirm
            :visible.sync="isShowConfirm"
            :presentableName="presentableName"
            :policyName="actPolicy.policyName"
            :confirmType="confirmType"
            @sure="confirmSure">
    </contract-confirm>
    <fe-toast :visible.sync="isShowToast" :msg="toastMsg" :isAutoHide="false"></fe-toast>
  </div>
</template>

<script>
  import { Message, MessageBox, Loading, Dialog } from 'element-ui'
  import FeToast from '../freelog-toast/freelog-toast.vue'
  import ContractConfirm from './confirm.vue'
  import ContractDetail from '../contract-detail/index.vue'

  import {
    getContractState,
  } from './common.js'

  export default {
    name: 'resource-contract',
    components: {
      'el-dialog': Dialog,
      FeToast, ContractConfirm, ContractDetail
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
        resourceIntro: '',
        isActPolicyDefault: false,
        actPolicyIndex: 0,
        isShowConfirm: false,
        confirmType: '',
        isShowToast: false,
        toastMsg: '',
        isOpenContractRecordBox: false,
        contractRecords: [],
        isEditRemark: false,
        targetRemark: '',
        currentRemark: '',
        editType: ''

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
        this.targetRemark = this.currentRemark = this.selectedContract.remark
      },
      exchangeDefaultContract() {
        const contractMap = this.resourceIdContractsMap[this.actPolicy.resourceId]
        if(contractMap) {
          for(let segmentId in contractMap) {
              contractMap[segmentId].isDefault = this.actPolicy.segmentId === segmentId ? 1 : 0
          }
        }
      },
      // 关闭对话框
      closeModalHandler({ shouldUpdate }) {
        if(shouldUpdate) {
          this.queryContractState(this.selectedContract.contractId)
        }
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
      confirmSure({isSetDefault}) {
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
      toggleEditRemark(type) {
        this.isEditRemark = !this.isEditRemark
        this.editType = type
        this.currentRemark = this.targetRemark
      },
      updateRemark(event) {
        var remark = event.target.value
        var msg = this.editType === 'add' ? '是否添加该备注？' : '是否更新该备注'

        MessageBox.confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          this.$axios.put(`/v1/contracts/${this.selectedContract.contractId}`,{
            remark
          })
          .then(res => res.data)
          .then(res => {
            if(res.errcode === 0) {
              this.currentRemark = this.targetRemark = remark
              this.isEditRemark = false

              Message.success(this.editType === 'add' ? '备注添加成功' : '备注修改成功')
            }else {
              Promise.reject(res.msg)
            }
          })
        })
        .catch(() => {
          this.isEditRemark = false
          this.targetRemark = this.currentRemark
        })
      }
    },
    watch: {
      presentable() {
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

