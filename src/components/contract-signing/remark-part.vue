<template>
  <div class="rcb-remark" >
    <div class="rcb-r-left">
        <span
                v-if="currentRemark === ''"
                class="rcb-add-remark"
                id="rcb-remak"
                @click="toggleEditRemark('add')"
        > 添加备注 <i class="el-icon-plus"></i></span>
      <span v-else  @click="toggleEditRemark('update')"> 备注 <i class="el-icon-edit-outline"></i></span>
    </div>
    <div class="rcb-r-right">
        <textarea
                v-if="isEditRemark"
                name="rcb-remak"
                v-model="targetRemark"
                rows="2"
                @blur.native="updateRemark">
        </textarea>
      <div v-else>{{targetRemark}}</div>
    </div>
  </div>
</template>

<script>
  import { Message, MessageBox } from 'element-ui'
  export default {
    name: 'contract-remark',
    props: {
      contract: {
        type: Object
      }
    },
    components: {},
    data() {
      return {
        isEditRemark: false,
        targetRemark: '',
        currentRemark: '',
        editType: ''
      }
    },
    computed: {},
    methods: {
      toggleEditRemark(type) {
        this.isEditRemark = !this.isEditRemark
        this.editType = type
        this.currentRemark = this.targetRemark
      },
      updateRemark(event) {
        var self = this
        var remark = event.target.value
        var msg = this.editType === 'add' ? '是否添加该备注？' : '是否更新该备注'

        MessageBox.confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true,
          callback(action) {
            if(action === 'confirm') {
              self.$axios.put(`/v1/contracts/${self.contract.contractId}`,{
                remark
              })
                .then(res => res.data)
                .then(res => {
                  if(res.errcode === 0) {
                    self.contract.remark = self.currentRemark = self.targetRemark = remark
                    self.isEditRemark = false

                    Message.success(self.editType === 'add' ? '备注添加成功' : '备注修改成功')
                  }else {
                    return Promise.reject(res.msg)
                  }
                })
                .catch(Message.error)
            }else {
              self.isEditRemark = false
              self.targetRemark = self.currentRemark
            }
          }
        })
      }},
    watch: {
      contract (){
        this.currentRemark = this.targetRemark = this.contract.remark
      }
    },
    beforeMount() {
      this.currentRemark = this.targetRemark = this.contract.remark
    }
  }
</script>

<style lang="less" type="text/less" scoped>
  .rcb-remark {
    display: flex;
    height: 64px;
    margin-top: 30px;
    font-size: 14px;
    color: #222;
    font-weight: bold;

    .rcb-add-remark {
      color: #3C99FC;
      cursor: pointer;

      i{ font-weight: bold; }
    }
    .rcb-r-left {
      margin-right: 20px;
    }
    .rcb-r-right {
      flex: 1;

      textarea {
        box-sizing: border-box;
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        outline: none;
        resize: none;
        border-color: #cecece;
      }
    }
  }
</style>