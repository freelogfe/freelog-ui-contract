<template>
  <div>
    <fe-dialog
            title-text-align="center"
            :close-on-click-modal="false"
            title="提示"
            width="440px"
            top="25vh"
            :visible.sync="visible"
            is-destoryed-body
            @close="confirmCancel"
    >
      <div class="rcb-confirm-cont">
        <div class="confirm-set-default-contract" v-if="confirmType === 'set-default-contract'">
          将当前合约设置为默认合约？
        </div>
        <div class="confirm-sign-contract" v-if="confirmType === 'sign-contract'">
          <div class="csn-presentable-name"><span>资源名称</span>&nbsp;&nbsp;&nbsp;&nbsp;{{presentableName}}</div>
          <div class="csn-policy-name">确认以&nbsp;&nbsp;&nbsp;&nbsp;{{policyName}}&nbsp;&nbsp;&nbsp;&nbsp;签约合约？</div>
          <div class="csn-set-default">
            <el-checkbox v-model="isSetDefault">将此合约设定为默认合约</el-checkbox>
          </div>
        </div>
      </div>
      <div slot="footer">
        <div class="rcb-confirm-btn-box">
          <button class="cbb-btn cbb-cancel" @click="confirmCancel">取消</button>
          <button class="cbb-btn cbb-sure" @click="confirmSure">确认</button>
        </div>
      </div>
    </fe-dialog>
  </div>
</template>

<script>
  import FeDialog from '../fe-dialog/fe-dialog'
  import { Checkbox } from 'element-ui'
  export default {
    name: 'contract-confirm',
    components: {
      FeDialog,
      "el-checkbox": Checkbox
    },
    props: {
      visible: {
        type: Boolean,
      },
      confirmType: {
        type: String,
      },
      presentableName: {
        type: String,
      },
      policyName: {
        type: String
      }
    },
    data() {
      return {
        isSetDefault: false
      }
    },
    methods: {
      toggleSetDefaultContract() {
        this.isSetDefault = !this.isSetDefault
      },
      confirmCancel() {
        this.$emit('cancel')
      },
      confirmSure() {
        this.$emit('sure',{ isSetDefault: this.isSetDefault })
      },
    }

  }
</script>

<style lang="less" type="text/less" scoped>
  .rcb-confirm-cont{
    text-align: center;

    .confirm-set-default-contract{
      font-size: 16px;
      font-weight: bold;
      color: #222;
    }

    .csn-presentable-name{
      margin-bottom: 20px;
      font-size: 16px;
      color: #333;
    }

    .csn-policy-name{
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: bold;
      color: #222;
    }

    .csn-set-default{
      font-size: 14px;
      color: #c6c6c6;
      cursor: pointer;
    }

  }

  .rcb-confirm-btn-box{
    text-align: center;

    .cbb-btn {
      padding: 6px 20px;
      font-size: 14px;
      border: none;
      outline: 0;
      cursor: pointer;

      &.cbb-cancel {
        color: #666;
      }
      &.cbb-sure {
        border: 1px solid #CECECE;
        border-radius: 4px;
        color: #333;

        &.disabled {
          border: 1px solid #CECECE;
          border-radius: 4px;
          background: #F9F9F9;
          color: #999;
          pointer-events: none;
        }
      }

    }
  }
</style>