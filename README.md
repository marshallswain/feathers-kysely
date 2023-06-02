# feathers-kysely

[![Download Status](https://img.shields.io/npm/dm/feathers-kysely.svg?style=flat-square)](https://www.npmjs.com/package/feathers-kysely)
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/qa8kez8QBx)

> Feathers SQL service adapter built with Kysely

## Installation

```bash
npm install feathers-kysely --save
```

## Documentation

Official docs are pending.  You can learn a lot from the tests, though:

- [Connect to a Database](https://github.com/marshallswain/feathers-kysely/blob/master/test/index.test.ts#L91-L115)
- [Create Tables](https://github.com/marshallswain/feathers-kysely/blob/master/test/index.test.ts#L120-L162)
- [Create Kysely Services](https://github.com/marshallswain/feathers-kysely/blob/master/test/index.test.ts#L226-L252)
- [Register Services](https://github.com/marshallswain/feathers-kysely/blob/master/test/index.test.ts#L268-L277)

## Note about custom queries

Like all Feathers services, you can access the underlying database adapter at `service.Model`.  One thing worth noting in `feathers-kysely` is that `service.Model` is the full Kysely instance and not locked down to the current table.  So you have to provide the table name in each of the methods that you use, like

- `service.Model.selectFrom('my-table')...`
- `service.Model.insertInto('my-table')...`
- `service.Model.updateTable('my-table')...`

## No Transactions-Specific Methods

Note that I haven't created any Feathers-specific tooling around doing transactions, yet, but you should be able to follow the [Kysely documentation on transactions](https://kysely-org.github.io/kysely/classes/Transaction.html#transaction) and put Feathers-Kysely service calls inside the execute block.

## License

Copyright (c) 2023 [Feathers contributors](https://github.com/feathersjs/feathers/graphs/contributors)

Licensed under the [MIT license](LICENSE).
