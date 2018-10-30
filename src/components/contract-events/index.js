import EscrowConfiscate from './escrow/confiscate'
import LicenseEvent from './license/license'
import TransactionEvent from './transaction/transaction'

const eventComponentMap = {
  transactionEvent: {
    type: TransactionEvent.name,
    title: '支付'
  },
  signingEvent: {
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