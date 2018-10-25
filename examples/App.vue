<template>
  <div id="app">
    hello ui-contract demo!

    <el-row>
      <el-button type="primary" @click="openSingleContract">open single-contract</el-button>
      <el-button type="primary" @click="openMultiContract">open multi-contract</el-button>
    </el-row>

    <dialog-contracts-single
            :visible.sync="isShowSingleContract"
            @close-dialog="hideAuthDialog"
            :presentable="scAuthPresentable || {}"
            :contractIDs="scAuthContractIDs"
    ></dialog-contracts-single>

    <dialog-contracts-multi
            :visible.sync="isShowMultiContracts"
            @close-dialog="hideAuthDialog"
            :presentableList="scAuthPresentableList"
            :contractIDs="scAuthContractIDs"
    ></dialog-contracts-multi>
  </div>
</template>

<script>

 import {
   DialogContractsMulti,
   DialogContractsSingle
 } from '../src/index'
 import FeDialog from '../src/components/fe-dialog/fe-dialog'
 import { Row, Button } from 'element-ui'

export default {
  name: 'app',
  data() {
    return {
      isShowSingleContract: false,
      isShowMultiContracts: false,
      scAuthPresentable: null,
      scAuthContractIDs: null,
      scAuthPresentableList: null,
      tempPresentable: null,
      tempPresentableList: null,
    }
  },
  components: {
    DialogContractsMulti,
    DialogContractsSingle,
    FeDialog,
    "el-row": Row,
    "el-button": Button
  },
  methods: {
    hideAuthDialog (){
      this.isShowSingleContract = false
    },
    beforeClose (){
      this.isShowSingleContract = false
    },
    openSingleContract() {
      this.$axios.get('/v1/presentables', { params: {
          nodeId: 10017
        }})
        .then(res => {
          if(res.status === 200 && res.data.data){
            const presentable = res.data.data.filter(item => item.resourceId === '425babee96a21278dbdd1e77b59c952bbb5757c0')[0]

            this.tempPresentable = presentable

            return this.getContractIDsbyResourceIDs(presentable.resourceId, "single")
          }
        })
    },
    openMultiContract() {
      this.$axios.get('/v1/presentables', { params: {
          nodeId: 10017
        }})
        .then(res => {
          if(res.status === 200 && res.data.data){
            const presentableList = res.data.data

            this.tempPresentableList = presentableList
            console.log('presentableList --', JSON.parse(JSON.stringify(presentableList)))
            const resourceIDs = presentableList.map(i => i.resourceId).join(',')
            return this.getContractIDsbyResourceIDs(resourceIDs, 'multi')
          }
        })


    },
    getContractIDsbyResourceIDs(resourceIds, type) {
      return this.$axios.get(`/v1/contracts/contractRecords?resourceIds=${resourceIds}&partyTwo=${this.userId}`)
        .then(res => {
          let contractIDs = []
          if (res.data.errcode === 0) {
            contractIDs = res.data.data.map(i => i.contractId)
          }

          this.scAuthContractIDs = contractIDs
          if(type === 'multi') {
            this.scAuthPresentableList = this.tempPresentableList
            this.isShowMultiContracts = true
          }else {
            this.scAuthPresentable = this.tempPresentable
            this.isShowSingleContract = true
          }
        })
    }

  },
  computed: {
    scTitle (){
      return `资源签约&nbsp;&nbsp;&nbsp;&nbsp;${window.location.hostname}`
    },
    userId() {
      return window.__auth_info__.__auth_user_id__ || 10008
    }
  },
  mounted() {
    // this.openSingleContract()
    this.openMultiContract()
  }

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
