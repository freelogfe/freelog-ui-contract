<template>
  <div v-if="isFetchedContracts">
    <div class="cutoff-line"></div>
    <div class="sc-content">
      <div class="sc-cont-header">
        {{presentableName}}
        <span
                :class="['sc-tag', `sc-tag-${contractState.type}`]"
        >{{contractState.tagName}}</span>
      </div>
      <resource-contract
              :presentable="presentable"
              :DCPolicyIndex.sync="DC_policyIndex"
              :resourceIdContractsMap="resourceIdContractsMap"
              @cancel="cancelSign"
              @refresh-contract="refreshContract">
      </resource-contract>
    </div>
  </div>
</template>

<script>
  import { Message } from 'element-ui'
import resourceContract from './signing-box.vue'
import {
  getContractState,
  resolvePresentableDefaultContractState,
} from './common.js'

export default {
  name: 'single-contract',
  components: {
    resourceContract,
  },
  props: {
    presentable: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      DC_policyIndex: 0,
      resourceName: '',
      defaultContract: null,
      contractState: null, // 资源标签状态
      contracts: [],
      isFetchedContracts: false
    }
  },
  methods: {
    reInitialData() {
      this.getContracts()
    },
    // 获取该资源的所有合同
    getContracts() {
      const { resourceId, userId } = this.presentable
      return this.$axios.get(`/v1/contracts/contractRecords?resourceIds=${resourceId}&partyTwo=${userId}&isDefault=1`)
        .then(res => {
          if(res.data.errcode === 0) {
            return res.data.data
          }else {
            return Promise.reject(rea.data.msg)
          }
        })
        .then(contracts => {
          this.isFetchedContracts = true
          this.contracts = contracts
          this.presentable.policy = this.presentable.policy.filter(p => p.status === 1)
          this.setContractState()
          this.DC_policyIndex = this.presentable.DC_policyIndex
        })
        .catch((e) => Message.error(e))
    },
    // 点击取消
    cancelSign() {
      this.$emit('cancel-sign')
    },
    // 默认合同的状态更新
    refreshContract(contract) {
      console.log('refreshContract --', contract)
      if(contract) {
        const { resourceId, segmentId } = contract
        this.resourceIdContractsMap[resourceId] = this.resourceIdContractsMap[resourceId] || {}
        this.resourceIdContractsMap[resourceId][segmentId] = contract
      }

      this.setContractState()
      this.$forceUpdate()
    },
    setContractState() {
      resolvePresentableDefaultContractState(this.presentable, this.resourceIdContractsMap)
      this.contractState = getContractState(this.presentable._defaultContract)
    }
  },
  computed: {
    // dislog 标题
    title() {
      return `资源签约&nbsp;&nbsp;&nbsp;&nbsp;${window.location.host}`
    },
    // 节点资源名称
    presentableName() {
      return this.presentable.presentableName
    },
    // 策略集合
    policyList() {
      return this.presentable.policy
    },
    // 合同与 资源ID和策略 的关系
    resourceIdContractsMap() {
      const map = {}
      this.contracts.forEach((contract) => {

        let obj = map[contract.resourceId] || {}
        obj[contract.segmentId] = contract
        map[contract.resourceId] = obj
      })
      return map
    }
  },
  watch: {
    DC_policyIndex() {
      this.setContractState()
    }
  },
  beforeMount() {
    this.reInitialData()
  },
  destroyed() {

  }
}
</script>

<style lang='less' scoped type="text/less">
  .sc-fe-dislog-footer {
    padding: 0 45px;
    text-align: right;

    .btn-normal {
      padding: 10px 26px;
      font-size: 14px;
      border: none;
      outline: 0;

      &.btn-cancel {
        color: #666;
      }
      &.btn-sign {
        border: 1px solid #CECECE;
        border-radius: 4px;
        color: #333;
      }
    }
  }

  .cutoff-line {
    position: relative;
    top: -20px;
    height: 1px;
    margin: 0 -20px;
    background: #ddd;
  }

  .sc-content {
    padding: 0 45px; text-align: left;

    .sc-cont-header {
      padding: 5px 0 10px;
      border-bottom: 1px solid #eee;
      font-size: 16px;
      color: #222;
      font-weight: bold;

    }
  }
</style>

