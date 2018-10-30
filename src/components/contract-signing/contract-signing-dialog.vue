<template>
  <fe-dialog
          :close-on-click-modal="false"
          :title="title"
          :width="dWidth"
          top="5vh"
          :visible.sync="isShowDialog"
          @close="handleClose"
  >

    <single-contract
            v-if="presentableList.length && presentableList.length === 1"
            :presentable="presentableList[0]"
            @cancel-sign="cancelSign"
    ></single-contract>
    <multi-contracts
            v-if="presentableList.length && presentableList.length > 1"
            :presentableList="presentableList"
            @cancel-sign="cancelSign"
    ></multi-contracts>
  </fe-dialog>
</template>

<script>
  import FeDialog from '../fe-dialog/fe-dialog.vue'
  import SingleContract from './contract-single'
  import MultiContracts from './contracts-multi.vue'

  export default {
    name: 'contract-signing-dialog',
    components: { FeDialog, SingleContract, MultiContracts },
    props: {
      visible: {
        type: Boolean
      },
      presentableList: {
        type: Array,
      }
    },
    data() {
      return {
        isShowDialog: false,
        callbackData: {}
      }
    },
    methods: {
      cancelSign(data) {
        this.isShowDialog = false
        this.callbackData = data
      },
      handleClose() {
        this.isShowDialog = false
        this.$emit('update:visible', false)
        this.$emit('close-dialog', this.callbackData)
      },
      init() {
        this.isShowDialog = this.visible
      },
    },
    computed: {
      title(){
        return `资源签约&nbsp;&nbsp;&nbsp;&nbsp;${window.location.hostname}`
      },
      dWidth() {
        return this.presentableList.length > 1 ? '1000px' : '790px'
      }
    },
    watch: {
      visible(newV) {
        this.isShowDialog = newV
      }
    },
    beforeMount() {
      this.init()
    }
  }
</script>