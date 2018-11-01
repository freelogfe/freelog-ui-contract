<template>
  <div v-if="contracts.length">
    <div v-if="type ==='single'">
      <div class="sc-content">
        <div class="sc-cont-header">
          {{presentableName}}
          <span
                  :class="['sc-tag', `sc-tag-${dContractType}`]"
          >{{dContractTagName}}</span>
        </div>
        <resource-contract
                :defaultContract.sync="defaultContract"
                :presentable="presentable">
        </resource-contract>
      </div>
    </div>
    <div v-else>
      <resource-contract
              v-if="!!defaultContract"
              :defaultContract.sync="defaultContract"
              :presentable="presentable">
      </resource-contract>
    </div>

  </div>


</template>

<script>
  import { Message } from 'element-ui'
  import resourceContract from './signing-box.vue'
  import { getContractState, } from './common.js'
  import { getUserInfo } from "../../utils.js"

  export default {
    name: 'contract-signing-single',
    components: {
      resourceContract,
    },
    props: {
      type: {
        type: String,
        default: 'single'
      },
      presentable: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        defaultContract: null,
        dContractType: '',
        dContractTagName: '',
        contracts: [],
      }
    },
    computed: {
      // 节点资源名称
      presentableName() {
        return this.presentable.presentableName
      },
      userId() {
        var userInfo = getUserInfo()
        return userInfo && userInfo.userId
      },
    },
    methods: {
      reInitialData() {
        this.getContracts()
      },
      // 获取该资源的所有合同
      getContracts() {
        const { resourceId } = this.presentable
        return this.$axios.get(`/v1/contracts/contractRecords?resourceIds=${resourceId}&partyTwo=${this.userId}`)
          .then(res => {
            if(res.data.errcode === 0) {
              return res.data.data
            }else {
              return Promise.reject(rea.data.msg)
            }
          })
          .then(contracts => {
            this.contracts = contracts
            this.presentable.policy = this.presentable.policy.filter(p => p.status === 1)
            this.resolveContracts()
            this.resolveDefaultContractState()
          })
          .catch((e) => Message.error(e))
      },
      resolveContracts (){
        var map = {}
        this.contracts.forEach(contract => {
          if(contract.isDefault) {
            this.defaultContract = contract
          }
          map[contract.segmentId] = contract
        })

        this.presentable.policy.forEach(p => {
          p.contract = map[p.segmentId] || null
        })
      },
      resolveDefaultContractState() {
        const { type, tagName } = getContractState(this.defaultContract)
        this.dContractType = type
        this.dContractTagName = tagName
      }
    },
    watch: {
      defaultContract() {
        this.$emit('update-default-contract', this.defaultContract)
      },
      presentable() {
        this.contracts = []
        this.reInitialData()
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

