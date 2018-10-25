export function resolvePresentableDefaultContractState(presentable, resourceIdContractsMap) {
  const { index, defaultContract } = getHasDefaultContractPolicyIndex(presentable, resourceIdContractsMap)
  presentable.DC_policyIndex = index
  presentable._defaultContract = defaultContract
  presentable.contractState = getContractState(defaultContract)
}
// 根据合同获取 资源标签状态
export function getContractState(contract) {
  if (!contract) {
    return { type: 'nosign', tagName: '未签约', info: '未签约' }
  }
  switch (contract.status) {
    case 1:
    case 2:
      return { type: 'inactive', tagName: '不可用', info: `合同ID ${contract.contractId}` }
    case 4:
      return { type: 'active', tagName: '可用', info: `合同ID ${contract.contractId}` }
    case 3:
    case 5:
    case 6:
      return { type: 'terminate', tagName: '合同终止', info: '合同终止' }
    default:
      return { type: 'nosign', tagName: '未签约', info: '未签约' }
  }
}

// 获取含有默认合同的policy序号
export function getHasDefaultContractPolicyIndex(presentable, resourceIdContractsMap) {
  const { resourceId, policy } = presentable
  var index = 0, defaultContract = null
  const contractMap = resourceIdContractsMap[resourceId]
  if(contractMap) {
    for(let i = 0; i < policy.length; i++) {
      let segmentId = policy[i].segmentId
      let contract = contractMap[segmentId]
      if(contract && contract.isDefault === 1) {
        index = i
        defaultContract = contract
        break
      }
    }
  }

  return { index, defaultContract }
}


// 处理策略与合同的关系
export function resolvePolicyContractState(policyList, resourceIdContractsMap) {
  policyList.forEach((policy) => {
    var contractMap = resourceIdContractsMap[policy.resourceId]
    var contract = null
    if(contractMap) {
      contract = contractMap[policy.segmentId] || null
    }
    policy.contractState = getContractState(contract)
  })
}

