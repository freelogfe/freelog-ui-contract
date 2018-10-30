<template>
  <div v-if="isFetchedContracts">
    <div class="cutoff-line"></div>
    <div class="sc-content">
      <div class="sc-left-box sc-resource-list">
        <ul>
          <li class="sc-resource-item"
              :class="{'active': index === selectedIndex}"
              v-for="(item, index) in presentableList"
              :key="'sc-item-' + (index + 1)"
              @click="selectedResource(index)">
            {{item.presentableName}}
            <div class="sc-tag-box" v-if="item.contractState">
              <span :class="['sc-tag', `sc-tag-${item.contractState.type}`]">
                {{item.contractState.tagName}}
              </span>
            </div>
          </li>
        </ul>
      </div>
      <div class="sc-cutoff-line-2"></div>
      <div class="sc-right-box">
        <resource-contract :presentable="selectedPresentable"
                           :DCPolicyIndex.sync="DC_policyIndex"
                           :resourceIdContractsMap="resourceIdContractsMap"
                           @cancel="cancelSign"
                           @refresh-contract="refreshContract">
        </resource-contract>
      </div>
    </div>
  </div>
</template>

<script>
  import { Message } from 'element-ui'
import resourceContract from './signing-box.vue'
import {
  getContractState,
  resolvePolicyContractState,
  resolvePresentableDefaultContractState,
} from './common.js'

export default {
  name: 'multi-contracts',
  components: {
    resourceContract,
  },
  props: {
    presentableList: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      DC_policyIndex: 0,
      selectedIndex: 3,
      isFetchedContracts: false,
      contracts: [],
    }
  },
  methods: {
    init() {

      const resourceIds = this.presentableList.map(p => p.resourceId)
      const userId = this.presentableList[0].userId
      return this.$axios.get(`/v1/contracts/contractRecords?resourceIds=${resourceIds}&partyTwo=${userId}`)
        .then(res => {
          if(res.data.errcode === 0) {
            return res.data.data
          }else {
            return Promise.reject(res.data.msg)
          }
        })
        .then((contracts) => {
          this.contracts = contracts
          this.filterPresentableListPolicy()
          resolvePolicyContractState(this.targPolicyList, this.resourceIdContractsMap)
          this.resolvePresentableListDefaultContractState()
          this.DC_policyIndex =  this.selectedPresentable.DC_policyIndex
          this.isFetchedContracts = true
        })
        .catch(e => Message.error(e))
    },
    // 刷新合同状态
    refreshContract(contract) {
      console.log('refreshContract --', contract)
      if(contract) {
        const { resourceId, segmentId } = contract
        this.resourceIdContractsMap[resourceId] = this.resourceIdContractsMap[resourceId] || {}
        this.resourceIdContractsMap[resourceId][segmentId] = contract
      }

      this.resolvePresentableListDefaultContractState()
      // resolvePolicyContractState(this.targPolicyList, this.resourceIdContractsMap)
      this.$forceUpdate()
    },
    selectedResource(index) {
      this.selectedIndex = index
      resolvePolicyContractState(this.targPolicyList, this.resourceIdContractsMap)
    },
    resolvePresentableListDefaultContractState() {
      this.presentableList.forEach((presentable) => resolvePresentableDefaultContractState(presentable, this.resourceIdContractsMap))
    },

    filterPresentableListPolicy() {
      this.presentableList.forEach(presentable => {
        presentable.policy = presentable.policy.filter(p => p.status === 1)
      })
    },
    // 点击取消
    cancelSign() {
      this.$emit('cancel-sign')
    }
  },
  computed: {
    title() {
      return `资源签约&nbsp;&nbsp;&nbsp;&nbsp;${window.location.host}`
    },
    selectedPresentable() {
      return this.presentableList[this.selectedIndex]
    },
    selectedResourceId() {
      return this.selectedPresentable.resourceId
    },
    targPolicyList() {
      return this.selectedPresentable.policy.map(p => {
        p.resourceId = this.selectedResourceId
        return p
      })
    },
    // 合同与策略的关系
    resourceIdContractsMap() {
      const map = {}
      this.contracts.forEach((contract) => {

        const obj = map[contract.resourceId] || {}
        obj[contract.segmentId] = contract
        map[contract.resourceId] = obj
      })
      return map
    }
  },
  watch: {
    selectedIndex() {
      this.DC_policyIndex = this.selectedPresentable.DC_policyIndex
    },
    DC_policyIndex() {
      resolvePresentableDefaultContractState(this.selectedPresentable, this.resourceIdContractsMap)
    }
  },
  beforeMount() {
    this.init()
  },
  mounted() {

  },
  destroyed() {

  }
}
</script>

<style lang='less' scoped type="text/less">

  .cutoff-line {
    position: relative;
    top: -20px;
    height: 1px;
    margin: 0 -20px;
    background: #ddd;
  }

  .sc-content {
    position: relative;
    /*display: flex;*/
    margin: 0 -20px;
    text-align: left;
  }

  .sc-left-box {
    width: 300px;
    min-width: 300px;
  }

  .sc-cutoff-line-2 {
    position: absolute;
    left: 300px;
    top: -20px;
    bottom: -20px;
    width: 1px;
    background-color: #ddd;
  }

  .sc-right-box {
    position: relative;
    top: -20px;
    margin-left: 300px;
    flex: 1;
    padding: 0 20px;
  }

  .sc-resource-list {
    position: absolute;
    top: 0;
    bottom: 0;
  }

  .sc-resource-list ul {
    overflow-y: scroll;
    position: absolute;
    left: 0;
    top: -20px;
    bottom: -20px;
    right: 0;
  }

  .sc-resource-item {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 10px 20px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    color: #222;

    &.active {
      padding-left: 17px;
      border-left: 3px solid #3C99FC;
      background-color: #f4f4f4;
    }
  }

  .sc-tag-box{
    margin-top: 5px;

    .sc-tag{
      margin-left: 0;
    }
  }

</style>

