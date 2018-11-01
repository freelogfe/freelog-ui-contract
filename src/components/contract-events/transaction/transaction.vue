<template>
  <div class="transaction-wrap">

    <el-form label-position="left" class="small-el-form" label-width="120px" :model="contractDetail">
      <el-form-item label="合同ID">
        {{contractDetail.contractId}}
      </el-form-item>
      <el-form-item label="甲方">
        {{contractDetail.partyOne}}
      </el-form-item>
      <el-form-item label="乙方">
        {{contractDetail.partyTwo}}
      </el-form-item>
      <el-form-item label="转入账号" v-if="false">
        {{params.contractAccountName}}
      </el-form-item>
      <el-form-item label="转账金额" v-if="amount !== 0">
        {{amount}} {{unitType}}
      </el-form-item>
      <el-form-item :label="accountLabel">
        <el-select
                :loading="isLoadingAccount"
                loading-text="正在获取账户中..."
                size="small"
                placeholder="请选择"
                v-model="accountId"
                @visible-change="selectVisibleChange"
        >
          <el-option
            v-for="item in accountOptions"
            :key="item.accountId"
            :label="item.accountId"
            :value="item.accountId">
          </el-option>
        </el-select>
        <el-tooltip placement="top">
          <div slot="content">
            <p><a style="color: white" href="//www.testfreelog.com/accounts" target="_blank">没有账号？去添加一个</a></p>
          </div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="支付密码" class="t-password" v-if="isNeedPassword">
        <el-input type="password" size="small" style="max-width: 300px;" v-model="password"
                  placeholder="请输入支付密码"></el-input>
      </el-form-item>
      <el-form-item class="button-group">
        <el-button @click="doneHandler">取 消</el-button>
        <el-button type="primary" @click="sure" :disabled="!isCanSubmit">确 定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>


<script>
import TransactionEvent from './index.js'

export default TransactionEvent
</script>

<style lang="less" type="text/less" scoped>
  .transaction-wrap {
    width: 400px;
    margin: auto;

    .el-form-item {

      &.t-password{
        margin-top: 10px;
      }
    }

    .button-group {
      margin-top: 20px;
    }

    .el-tooltip{ margin-left: 10px; }
  }
</style>
