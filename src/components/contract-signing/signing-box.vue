<template>
  <div class="ss-main-content resource-contract-box">
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
    <div v-if="policyList.length">
      <div class="rcb-tab-box">
        <ul :class="{'disabled': isOpenContractRecordBox}">
          <li
                  class="rcb-tab-item"
                  :class="{'active': index === actPolicyIndex}"
                  v-for="(item, index) in policyList"
                  :key="'rc-tab-'+(index+1)"
                  @click="exchangePolicy(index)"
          >{{item.policyName + (item.contract ? '(已签约)': '')}}
          </li>
        </ul>
        <div
                class="rcb-contract-record"
                :class="{'disabled': contractRecords.length === 0, 'opened': isOpenContractRecordBox}"
                @click="toggleContractRecordBox"
        ></div>
      </div>
      <div class="rcb-tab-pane">
        <div class="rcb-tp-contract-content">
          <contract-detail
                  v-if="!!selectedContract"
                  :contract="selectedContract"
                  @update-contract="closeModalHandler">
          </contract-detail>
        </div>
        <div class="rcb-tp-status-bar">
          {{sContractInfo}}
          <div class="rcb-tp-sb-btn-box" v-if="actPolicy.contract">
            <button class="rcb-tp-sb-default" v-if="selectedContract.isDefault">默认合约</button>
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
      <contract-remark
              v-if="!!selectedContract"
              :contract="selectedContract"
      ></contract-remark>
      <div class="rcb-footer">
        <button type="button"
                class="btn-normal btn-sign"
                :class="{'disabled': !!actPolicy.contract}"
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
    </div>


    <fe-toast :visible.sync="isShowToast" :msg="toastMsg" :isAutoHide="false"></fe-toast>
  </div>
</template>

<script>
  import { Message } from 'element-ui'
  import FeToast from '../freelog-toast/freelog-toast.vue'
  import ContractConfirm from './confirm.vue'
  import ContractDetail from '../contract-detail/index.vue'
  import ContractRemark from './remark-part.vue'

  import { getContractState } from './common.js'

  export default {
    name: 'resource-contract',
    components: {
      FeToast, ContractConfirm,
      ContractDetail, ContractRemark
    },
    props: {
      presentable: {
        type: Object
      },
      defaultContract: {
        type: Object
      }
    },
    data() {
      return {
        resourceIntro: '',                // 资源描述
        selectedContract: null,           // 选中的合同
        policyList: [],
        actPolicyIndex: 0,
        isShowConfirm: false,
        confirmType: '',
        isShowToast: false,
        toastMsg: '',
        isOpenContractRecordBox: false,
        contractRecords: [],
        sContractInfo: ''
      }
    },
    computed: {
      userId() {
        return this.presentable.userId
      },
      resourceId() {
        return this.presentable.resourceId
      },
      presentableId() {
        return this.presentable.presentableId
      },
      resourceType() {
        return this.presentable.resourceInfo.resourceType
      },
      // 节点资源名称
      presentableName() {
        return this.presentable.presentableName
      },
      actPolicy: {
        get() {
          var actPolicy = this.policyList[this.actPolicyIndex]
          this.selectedContract = actPolicy.contract
          const { info } = getContractState(this.selectedContract)
          this.sContractInfo = info

          return actPolicy
        },
      },
    },
    methods: {
      init() {
        this.policyList = this.presentable.policy.map((p, index) => {
          p.resourceId = this.resourceId
          if(p.contract.contractId === this.defaultContract.contractId) {
            this.actPolicyIndex = index
          }
          return p
        })
        this.getContractRecords()

      },
      // 切换策略
      exchangePolicy(index) {
        this.actPolicyIndex = index
        this.selectedContract = this.policyList[index].contract
      },
      // 更新合同
      updateContract(contract) {
        this.actPolicy.contract = contract
        this.policyList.splice(this.actPolicyIndex, 1, this.actPolicy)
        if(contract.isDefault === 1){
          this.policyList.forEach(p => {
            if(p.contract) {
              p.contract.isDefault = p.contract.contractId === contract.contractId
            }
          })
          this.$emit('update:defaultContract', contract)
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
              this.updateContract(res.data)
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
              this.selectedContract.isDefault = 1
              this.updateContract(this.selectedContract)
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
    },
    watch: {
      presentable() {
        this.init()
      }
    },
    beforeUpdate() {

    },
    beforeMount() {
      this.init()
    },
    destroyed() {
      clearTimeout(this.timer)
    }
  }
</script>

<style lang="less" scoped type="text/less">
  @import './signing-box.less';
</style>

