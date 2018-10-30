<template>
  <el-dialog
          :close-on-click-modal="false"
          width="1000px"
          top="5vh"
          :visible.sync="isShowDialog"
          @close="handleClose"
  >
    <div slot="title" class="contract-dialog-title">
      资源签约<span>{{hostname}}</span>
    </div>
    <contract-signing-multi
            v-if="presentableList.length"
            :presentableList="presentableList"
            @cancel-sign="cancelSign"
    ></contract-signing-multi>
  </el-dialog>
</template>

<script>

  import { Dialog } from 'element-ui'
  import ContractSigningMulti from './signing-multi.vue'

  export default {
    name: 'contract-signing-dialog',
    components: { 'el-dialog': Dialog, ContractSigningMulti },
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
      hostname(){
        return window.location.hostname
      },
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

<style lang="less" type="text/less" scoped>
  .contract-dialog-title {
    color: #222;
    font-size: 16px;
    font-weight: bold;
    text-align: left;

    span {
      margin-left: 16px;
    }
  }

</style>