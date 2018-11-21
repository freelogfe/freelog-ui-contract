# freelog-ui-contract

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Policy Template
模版1-免费
```text
for public:
  initial:
    active
    recontractable
    terminate
```

模版2-保证金
```text
for public:
  escrow account acct
  custom event acceptor.customEvent

  initial:
    proceed to auth on acct exceed 10 feather
  auth:
    presentable
    active
    proceed to refund on acct.confiscated
  refund:
    proceed to finish on acct.refunded
  finish:
    terminate
```

模版3-License-MIT
```text
for public:
  initial:
    proceed to auth on accepting agreement @855f00b7221e2bb99aa97ea503b9f2e93682db3a
  auth:
    presentable
    active
    terminate
```

