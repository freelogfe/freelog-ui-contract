import { Checkbox, Form, FormItem, Button, Message } from 'element-ui'
export default {
  name: 'license-event',
  props: ['contractDetail', 'params'],
  components: {
    "el-checkbox": Checkbox,
    "el-form": Form,
    "el-form-item": FormItem,
    "el-button": Button
  },
  data() {
    return {
      accepted: false,
      licenses: []
    }
  },
  methods: {
    loadLicenses() {
      const promises = this.params.licenseIds.map(rid => this.loadLicenseContent(rid))

      Promise.all(promises).then((list) => {
        this.licenses = list
      }).catch(this.$error.showErrorMessage)
    },
    loadLicenseContent(resourceId) {
      return this.$axios.get(`/v1/auths/resource/${resourceId}.data`)
        .then((res) => {
          if(typeof res.data.errcode !== 'undefined' && res.data.errcode === 15) {
            Message.warning('协议格式不正确，请联系合约作者。')
            return
          }
          return res.data
        })
    },
    signHandler() {
      this.$axios.post('/v1/contracts/events/signingLicenses', {
        contractId: this.contractDetail.contractId,
        eventId: this.params.eventId,
        licenseIds: this.params.licenseIds
      }).then((res) => {
        if (res.data.errcode === 0) {
          this.doneHandler(true)
          Message.success('执行成功')
        } else {
          Message.error(res.data.msg)
        }
      })
    },
    doneHandler(shouldUpdate, data = {}) {
      this.$emit('close', { shouldUpdate, data })
    }
  },
  mounted() {
    this.loadLicenses()
  }
}
