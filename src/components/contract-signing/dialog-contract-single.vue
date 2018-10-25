<template>
  <fe-dialog
          :close-on-click-modal="false"
          :title="scTitle"
          width="790px"
          top="5vh"
          :visible.sync="isShowDialog"
          @close="handleClose"
          is-destoryed-body
  >
    <single-contract
            :presentable="presentable"
            :contractIDs="contractIDs"
            @close-dialog="handleClose"
    ></single-contract>
  </fe-dialog>
</template>

<script>
  import FeDialog from '../fe-dialog/fe-dialog.vue'
  import SingleContract from './contract-single'
  export default {
    name: 'DialogContractsSingle',
    components: { FeDialog, SingleContract },
    props: {
      visible: {
        type: Boolean
      },
      presentable: {
        type: Object,
      },
      contractIDs: {
        type: Array
      }
    },
    data() {
      return {
        isShowDialog: false
      }
    },
    methods: {
      handleClose(data) {
        this.$emit('close-dialog', data)
      },
    },
    computed: {
      scTitle (){
        return `资源签约&nbsp;&nbsp;&nbsp;&nbsp;${window.location.hostname}`
      },
    },
    watch: {
      isShowDialog(newV) {
        this.$emit('update:visible', newV)
      }
    },
    beforeUpdate() {
      this.isShowDialog = this.visible
    },
    beforeMount() {
      this.isShowDialog = this.visible
    }
  }
</script>