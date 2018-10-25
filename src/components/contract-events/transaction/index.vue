<!--<template>-->
  <!--<div class="transaction-wrap">-->
    <!--&lt;!&ndash;<el-alert&ndash;&gt;-->
      <!--&lt;!&ndash;v-if="tipMsg"&ndash;&gt;-->
      <!--&lt;!&ndash;:title="tipMsg"&ndash;&gt;-->
      <!--&lt;!&ndash;type="warning">&ndash;&gt;-->
    <!--&lt;!&ndash;</el-alert>&ndash;&gt;-->

    <!--&lt;!&ndash;<el-form label-position="left" class="small-el-form" label-width="80px" :model="contractDetail">&ndash;&gt;-->
      <!--&lt;!&ndash;<el-form-item label="合同ID">&ndash;&gt;-->
        <!--&lt;!&ndash;{{contractDetail.contractId}}&ndash;&gt;-->
      <!--&lt;!&ndash;</el-form-item>&ndash;&gt;-->
      <!--&lt;!&ndash;<el-form-item label="甲方">&ndash;&gt;-->
        <!--&lt;!&ndash;{{contractDetail.partyOne}}&ndash;&gt;-->
      <!--&lt;!&ndash;</el-form-item>&ndash;&gt;-->
      <!--&lt;!&ndash;<el-form-item label="乙方">&ndash;&gt;-->
        <!--&lt;!&ndash;{{contractDetail.partyTwo}}&ndash;&gt;-->
      <!--&lt;!&ndash;</el-form-item>&ndash;&gt;-->
      <!--&lt;!&ndash;<el-form-item label="转入账号">&ndash;&gt;-->
        <!--&lt;!&ndash;{{params.contractAccountName}}&ndash;&gt;-->
      <!--&lt;!&ndash;</el-form-item>&ndash;&gt;-->
      <!--&lt;!&ndash;<el-form-item label="转账金额">&ndash;&gt;-->
        <!--&lt;!&ndash;{{params.amount}} {{unitType}}&ndash;&gt;-->
      <!--&lt;!&ndash;</el-form-item>&ndash;&gt;-->
      <!--&lt;!&ndash;<el-form-item label="转出账号">&ndash;&gt;-->
        <!--&lt;!&ndash;<el-select :loading="isLoadingAccount" loading-text="正在获取账户中..." v-model="fromAccountId" size="small" placeholder="请选择" @visible-change="selectVisibleChange">&ndash;&gt;-->
          <!--&lt;!&ndash;<el-option&ndash;&gt;-->
            <!--&lt;!&ndash;v-for="item in options"&ndash;&gt;-->
            <!--&lt;!&ndash;:key="item.accountId"&ndash;&gt;-->
            <!--&lt;!&ndash;:label="item.accountId"&ndash;&gt;-->
            <!--&lt;!&ndash;:value="item.accountId">&ndash;&gt;-->
          <!--&lt;!&ndash;</el-option>&ndash;&gt;-->
        <!--&lt;!&ndash;</el-select>&ndash;&gt;-->
        <!--&lt;!&ndash;<el-tooltip placement="top">&ndash;&gt;-->
          <!--&lt;!&ndash;<div slot="content">&ndash;&gt;-->
            <!--&lt;!&ndash;<p><a style="color: white" href="//www.testfreelog.com/accounts" target="_blank">没有账号？去添加一个</a></p>&ndash;&gt;-->
          <!--&lt;!&ndash;</div>&ndash;&gt;-->
          <!--&lt;!&ndash;<i class="el-icon-question"></i>&ndash;&gt;-->
        <!--&lt;!&ndash;</el-tooltip>&ndash;&gt;-->
      <!--&lt;!&ndash;</el-form-item>&ndash;&gt;-->
      <!--&lt;!&ndash;<el-form-item label="支付密码">&ndash;&gt;-->
        <!--&lt;!&ndash;<el-input type="password" size="small" style="max-width: 300px;" v-model="password"&ndash;&gt;-->
                  <!--&lt;!&ndash;placeholder="请输入支付密码"></el-input>&ndash;&gt;-->
      <!--&lt;!&ndash;</el-form-item>&ndash;&gt;-->
      <!--&lt;!&ndash;<el-form-item>&ndash;&gt;-->
        <!--&lt;!&ndash;<el-button @click="doneHandler">取 消</el-button>&ndash;&gt;-->
        <!--&lt;!&ndash;<el-button type="primary" @click="pay" :disabled="order.status ==1||order.status ==2">确 定</el-button>&ndash;&gt;-->
      <!--&lt;!&ndash;</el-form-item>&ndash;&gt;-->
    <!--&lt;!&ndash;</el-form>&ndash;&gt;-->
  <!--</div>-->
<!--</template>-->

<template>
  <div>

  </div>
</template>

<script>
// import TransactionEvent from './index.js'

// export default TransactionEvent
export default {
  name: 'transaction-event',
}
</script>

<!--<style lang="less" type="text/less">-->
  <!--@import "index.less";-->
<!--</style>-->
