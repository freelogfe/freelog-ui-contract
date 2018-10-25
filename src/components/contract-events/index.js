import EscrowConfiscate from './escrow/confiscate'
import LicenseEvent from './license/index'
import TransactionEvent from './transaction/index'

const eventComponentMap = {
  transaction: {
    type: TransactionEvent.name,
    title: '支付'
  },
  signing: {
    type: LicenseEvent.name,
    title: '协议签署'
  },
  escrowConfiscated: {
    type: EscrowConfiscate.name,
    title: '保证金没收'
  }
}

export {
  LicenseEvent,
  TransactionEvent,
  EscrowConfiscate,
  eventComponentMap
}