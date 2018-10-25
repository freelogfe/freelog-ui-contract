<template>
  <fe-dialog
          :close-on-click-modal="false"
          :title="scTitle"
          width="1000px"
          top="5vh"
          :visible.sync="isShowDialog"
          @close="handleClose"
          is-destoryed-body
  >
    <multi-contracts
            :presentableList="presentableList"
            :contractIDs="contractIDs"
            @close-dialog="handleClose"
    ></multi-contracts>
  </fe-dialog>
</template>

<script>
  import FeDialog from '../fe-dialog/fe-dialog.vue'
  import MultiContracts from './contracts-multi.vue'
  export default {
    name: 'DialogContractsMulti',
    components: { FeDialog, MultiContracts },
    props: {
      visible: {
        type: Boolean
      },
      presentableList: {
        type: Array,
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
      }
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