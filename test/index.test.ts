import { Generated, Kysely, SqliteDialect } from 'kysely'
import Database from 'better-sqlite3'
import assert from 'assert'
import { feathers, HookContext, Service } from '@feathersjs/feathers'
import adapterTests from '@feathersjs/adapter-tests'
import { errors } from '@feathersjs/errors'
import { Ajv, getValidator, querySyntax, hooks } from '@feathersjs/schema'

import connection from './connection'
import { ERROR, KyselyAdapterParams, KyselyService } from '../src/index'
import { AdapterQuery } from '@feathersjs/adapter-commons/lib'

const testSuite = adapterTests([
  '.options',
  '.events',
  '._get',
  '._find',
  '._create',
  '._update',
  '._patch',
  '._remove',
  '.get',
  '.get + $select',
  '.get + id + query',
  '.get + NotFound',
  '.get + id + query id',
  '.find',
  '.remove',
  '.remove + $select',
  '.remove + id + query',
  '.remove + multi',
  '.remove + multi no pagination',
  '.remove + id + query id',
  '.update',
  '.update + $select',
  '.update + id + query',
  '.update + NotFound',
  '.update + query + NotFound',
  '.update + id + query id',
  '.patch',
  '.patch + $select',
  '.patch + id + query',
  '.patch multiple',
  '.patch multiple no pagination',
  '.patch multi query same',
  '.patch multi query changed',
  '.patch + NotFound',
  '.patch + query + NotFound',
  '.patch + id + query id',
  '.create',
  '.create ignores query',
  '.create + $select',
  '.create multi',
  'internal .find',
  'internal .get',
  'internal .create',
  'internal .update',
  'internal .patch',
  'internal .remove',
  '.find + equal',
  '.find + equal multiple',
  '.find + $sort',
  '.find + $sort + string',
  '.find + $limit',
  '.find + $limit 0',
  '.find + $skip',
  '.find + $select',
  '.find + $or',
  '.find + $and',
  '.find + $in',
  '.find + $nin',
  '.find + $lt',
  '.find + $lte',
  '.find + $gt',
  '.find + $gte',
  '.find + $ne',
  '.find + $gt + $lt + $sort',
  '.find + $or nested + $sort',
  '.find + $and + $or',
  'params.adapter + paginate',
  'params.adapter + multi',
  '.find + paginate',
  '.find + paginate + query',
  '.find + paginate + $limit + $skip',
  '.find + paginate + $limit 0',
  '.find + paginate + params',
])

const TYPE = process.env.TEST_DB || 'sqlite'

interface PeopleTable {
  id: Generated<number>
  name: string
  age: number
  time?: string
  created?: boolean
}
interface TodosTable {
  id: Generated<number>
  text: string
  personId: number
}

interface DB {
  todos: TodosTable
  people: PeopleTable
  users: PeopleTable
}

// Create Kysely connection to sqlite
const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: new Database('./test.sqlite'),
  }),
})

// Create a public database to mimic a "schema"
const schemaName = 'public'

const clean = async () => {
  // drop and recreate the todos table
  await db.schema.dropTable('todos').ifExists().execute()
  await db.schema
    .createTable('todos')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('text', 'text', (col) => col.notNull())
    .addColumn('personId', 'real', (col) => col.notNull())
    .execute()

  // drop and create the people table
  await db.schema.dropTable('people').ifExists().execute()
  await db.schema
    .createTable('people')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('age', 'real')
    .addColumn('time', 'real')
    .addColumn('created', 'boolean')
    .execute()

  // drop and create the people-customid table
  await db.schema.dropTable('people-customid').ifExists().execute()
  await db.schema
    .createTable('people-customid')
    .addColumn('customid', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('age', 'real')
    .addColumn('time', 'real')
    .addColumn('created', 'boolean')
    .execute()

  // drop and recreate the users table
  await db.schema.dropTable('users').ifExists().execute()
  await db.schema
    .createTable('users')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('age', 'real')
    .addColumn('time', 'real')
    .addColumn('created', 'boolean')
    .execute()
}

const personSchema = {
  $id: 'Person',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'name', 'age'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    age: { type: ['number', 'null'] },
    time: { type: 'string' },
    create: { type: 'boolean' },
  },
} as const
const personQuery = {
  $id: 'PersonQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(personSchema.properties, {
      name: {
        $like: { type: 'string' },
        $ilike: { type: 'string' },
        $notlike: { type: 'string' },
      },
    }),
  },
} as const
const validator = new Ajv({
  coerceTypes: true,
})
const personQueryValidator = getValidator(personQuery, validator)

type Person = {
  id: number
  name: string
  age: number | null
  time: string
  create: boolean
}

type Todo = {
  id: number
  text: string
  personId: number
  personName: string
}

type ServiceTypes = {
  people: KyselyService<Person>
  'people-customid': KyselyService<Person>
  users: KyselyService<Person>
  todos: KyselyService<Todo>
}

class TodoService extends KyselyService<Todo> {
  // createQuery(params: KyselyAdapterParams<AdapterQuery>) {
  //   const query = super.createQuery(params)
  //   query.join('people as person', 'todos.personId', 'person.id').select('person.name as personName')
  //   return query
  // }
}

const people = new KyselyService({
  Model: db,
  dialectType: 'sqlite',
  name: 'people',
  events: ['testing'],
})

const peopleId = new KyselyService({
  Model: db,
  id: 'customid',
  dialectType: 'sqlite',
  name: 'people-customid',
  events: ['testing'],
})

const users = new KyselyService({
  Model: db,
  dialectType: 'sqlite',
  name: 'users',
  events: ['testing'],
})

const todos = new TodoService({
  dialectType: 'sqlite',
  Model: db,
  name: 'todos',
})

describe.skip('insert test', () => {
  before(clean)
  it('inserts a record', async () => {
    const results = await db.insertInto('users').values({ name: 'test', age: 10 }).executeTakeFirst()
    const query = db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', results.insertId as any)
    const compiled = query.compile()
    const item = await query.executeTakeFirst()
  })
})

describe('Feathers Kysely Service', () => {
  const app = feathers<ServiceTypes>()
    // .hooks({
    //   before: [transaction.start()],
    //   after: [transaction.end()],
    //   error: [transaction.rollback()],
    // })
    .use('people', people)
    .use('people-customid', peopleId)
    .use('users', users)
    .use('todos', todos)
  const peopleService = app.service('people')

  peopleService.hooks({
    before: {
      find: [hooks.validateQuery(personQueryValidator)],
    },
  })
  // before(() => {
  //   if (TYPE === 'sqlite') {
  //     // Attach the public database to mimic a "schema"
  //     db.schema.raw(`attach database '${schemaName}.sqlite' as ${schemaName}`)
  //   }
  // })
  before(clean)
  after(clean)

  describe('$like method', () => {
    let charlie: Person

    beforeEach(async () => {
      charlie = await peopleService.create({
        name: 'Charlie Brown',
        age: 10,
      })
    })

    afterEach(() => peopleService.remove(charlie.id))

    it('$like in query', async () => {
      const data = await peopleService.find({
        paginate: false,
        query: { name: { $like: '%lie%' } },
      })

      assert.strictEqual(data[0].name, 'Charlie Brown')
    })
  })

  describe('$notlike method', () => {
    let hasMatch: Person
    let hasNoMatch: Person

    beforeEach(async () => {
      hasMatch = await peopleService.create({
        name: 'XYZabcZYX',
      })
      hasNoMatch = await peopleService.create({
        name: 'XYZZYX',
      })
    })

    afterEach(() => {
      peopleService.remove(hasMatch.id)
      peopleService.remove(hasNoMatch.id)
    })

    it('$notlike in query', async () => {
      const data = await peopleService.find({
        paginate: false,
        query: { name: { $notlike: '%abc%' } },
      })

      assert.strictEqual(data.length, 1)
      assert.strictEqual(data[0].name, 'XYZZYX')
    })
  })

  describe('adapter specifics', () => {
    let daves: Person[]

    beforeEach(async () => {
      daves = await Promise.all([
        peopleService.create({
          name: 'Ageless',
          age: null,
        }),
        peopleService.create({
          name: 'Dave',
          age: 32,
        }),
        peopleService.create({
          name: 'Dada',
          age: 1,
        }),
      ])
    })

    afterEach(async () => {
      try {
        await peopleService.remove(daves[0].id)
        await peopleService.remove(daves[1].id)
        await peopleService.remove(daves[2].id)
      } catch (error: unknown) {}
    })

    it('$or works properly (#120)', async () => {
      const data = await peopleService.find({
        paginate: false,
        query: {
          name: 'Dave',
          $or: [
            {
              age: 1,
            },
            {
              age: 32,
            },
          ],
        },
      })

      assert.strictEqual(data.length, 1)
      assert.strictEqual(data[0].name, 'Dave')
      assert.strictEqual(data[0].age, 32)
    })

    it('$and works properly', async () => {
      const data = await peopleService.find({
        paginate: false,
        query: {
          $and: [
            {
              $or: [{ name: 'Dave' }, { name: 'Dada' }],
            },
            {
              age: { $lt: 23 },
            },
          ],
        },
      })

      assert.strictEqual(data.length, 1)
      assert.strictEqual(data[0].name, 'Dada')
      assert.strictEqual(data[0].age, 1)
    })

    it('where conditions support NULL values properly', async () => {
      const data = await peopleService.find({
        paginate: false,
        query: {
          age: null,
        },
      })

      assert.strictEqual(data.length, 1)
      assert.strictEqual(data[0].name, 'Ageless')
      assert.strictEqual(data[0].age, null)
    })

    it('where conditions support NOT NULL case properly', async () => {
      const data = await peopleService.find({
        paginate: false,
        query: {
          age: { $ne: null },
        },
      })

      assert.strictEqual(data.length, 2)
      assert.notStrictEqual(data[0].name, 'Ageless')
      assert.notStrictEqual(data[0].age, null)
      assert.notStrictEqual(data[1].name, 'Ageless')
      assert.notStrictEqual(data[1].age, null)
    })

    it('where conditions support NULL values within AND conditions', async () => {
      const data = await peopleService.find({
        paginate: false,
        query: {
          age: null,
          name: 'Ageless',
        },
      })

      assert.strictEqual(data.length, 1)
      assert.strictEqual(data[0].name, 'Ageless')
      assert.strictEqual(data[0].age, null)
    })

    it('where conditions support NULL values within OR conditions', async () => {
      const data = await peopleService.find({
        paginate: false,
        query: {
          $or: [
            {
              age: null,
            },
            {
              name: 'Dada',
            },
          ],
        },
      })

      assert.strictEqual(data.length, 2)
      assert.notStrictEqual(data[0].name, 'Dave')
      assert.notStrictEqual(data[0].age, 32)
      assert.notStrictEqual(data[1].name, 'Dave')
      assert.notStrictEqual(data[1].age, 32)
    })

    it('attaches the SQL error', async () => {
      await assert.rejects(
        () => peopleService.create({}),
        (error: any) => {
          assert.ok(error[ERROR])
          return true
        },
      )
    })

    // it('get by id works with `createQuery` as params.kysely', async () => {
    //   const kysely = peopleService.createQuery()
    //   const dave = await peopleService.get(daves[0].id, { kysely })

    //   assert.deepStrictEqual(dave, daves[0])
    // })
  })

  // describe.skip('hooks', () => {
  //   type ModelStub = { getModel: () => typeof db }

  //   afterEach(async () => {
  //     db.schema.
  //     await db('people').truncate()
  //   })

  //   it('does reject on problem with commit', async () => {
  //     const app = feathers()

  //     // app.hooks({
  //     //   before: transaction.start(),
  //     //   after: [
  //     //     (context: HookContext) => {
  //     //       const client = context.params.transaction.trx.client
  //     //       const query = client.query

  //     //       client.query = (conn: any, sql: any) => {
  //     //         let result = query.call(client, conn, sql)

  //     //         if (sql === 'COMMIT;') {
  //     //           result = result.then(() => {
  //     //             throw new TypeError('Deliberate')
  //     //           })
  //     //         }

  //     //         return result
  //     //       }
  //     //     },
  //     //     transaction.end(),
  //     //   ],
  //     //   error: transaction.rollback(),
  //     // })

  //     app.use('/people', people)

  //     await assert.rejects(() => app.service('/people').create({ name: 'Foo' }), {
  //       message: 'Deliberate',
  //     })
  //   })

  //   it('does commit, rollback, nesting', async () => {
  //     const app = feathers<{
  //       people: typeof people
  //       test: Pick<Service, 'create'> & ModelStub
  //     }>()

  //     // app.hooks({
  //     //   before: transaction.start(),
  //     //   after: transaction.end(),
  //     //   error: transaction.rollback(),
  //     // })

  //     app.use('people', people)

  //     app.use('test', {
  //       getModel: () => db,
  //       create: async (data: any, params) => {
  //         const created = await app.service('people').create({ name: 'Foo' }, { ...params })

  //         if (data.throw) {
  //           throw new TypeError('Deliberate')
  //         }

  //         return created
  //       },
  //     })

  //     await assert.rejects(() => app.service('test').create({ throw: true }), {
  //       message: 'Deliberate',
  //     })

  //     assert.strictEqual((await app.service('people').find({ paginate: false })).length, 0)

  //     await app.service('test').create({})

  //     assert.strictEqual((await app.service('people').find({ paginate: false })).length, 1)
  //   })

  //   it('does use savepoints for nested calls', async () => {
  //     const app = feathers<{
  //       people: typeof people
  //       success: Pick<Service, 'create'> & ModelStub
  //       fail: Pick<Service, 'create'> & ModelStub
  //       test: Pick<Service, 'create'> & ModelStub
  //     }>()

  //     // app.hooks({
  //     //   before: transaction.start(),
  //     //   after: transaction.end(),
  //     //   error: transaction.rollback(),
  //     // })

  //     app.use('people', people)

  //     app.use('success', {
  //       getModel: () => db,
  //       create: async (_data, params) => {
  //         return app.service('people').create({ name: 'Success' }, { ...params })
  //       },
  //     })

  //     app.use('fail', {
  //       getModel: () => db,
  //       create: async (_data, params) => {
  //         await app.service('people').create({ name: 'Fail' }, { ...params })
  //         throw new TypeError('Deliberate')
  //       },
  //     })

  //     app.use('test', {
  //       getModel: () => db,
  //       create: async (_data, params) => {
  //         await app.service('success').create({}, { ...params })
  //         await app
  //           .service('fail')
  //           .create({}, { ...params })
  //           // eslint-disable-next-line @typescript-eslint/no-empty-function
  //           .catch(() => {})
  //         return []
  //       },
  //     })

  //     await app.service('test').create({})

  //     const created = await app.service('people').find({ paginate: false })

  //     assert.strictEqual(created.length, 1)
  //     assert.ok(created[0].name)
  //   })

  //   it('allows waiting for transaction to complete', async () => {
  //     const app = feathers<{
  //       people: typeof people
  //       test: Pick<Service, 'create'> & ModelStub
  //     }>()

  //     let seq: string[] = []

  //     app.hooks({
  //       before: [
  //         transaction.start(),
  //         (context: HookContext) => {
  //           seq.push(`${context.path}: waiting for trx to be committed`)
  //           context.params.transaction.committed.then((success: any) => {
  //             seq.push(`${context.path}: committed ${success}`)
  //           })
  //         },
  //         async (context: HookContext) => {
  //           seq.push(`${context.path}: another hook`)
  //         },
  //       ],
  //       after: [
  //         transaction.end(),
  //         (context: HookContext) => {
  //           seq.push(`${context.path}: trx ended`)
  //         },
  //       ],
  //       error: [
  //         transaction.rollback(),
  //         (context: HookContext) => {
  //           seq.push(`${context.path}: trx rolled back`)
  //         },
  //       ],
  //     })

  //     app.use('people', people)

  //     app.use('test', {
  //       getModel: () => db,
  //       create: async (data: any, params) => {
  //         const peeps = await app.service('people').create({ name: 'Foo' }, { ...params })

  //         if (data.throw) {
  //           throw new TypeError('Deliberate')
  //         }
  //         return peeps
  //       },
  //     })

  //     assert.deepStrictEqual(seq, [])

  //     await assert.rejects(() => app.service('test').create({ throw: true }), {
  //       message: 'Deliberate',
  //     })

  //     assert.deepStrictEqual(seq, [
  //       'test: waiting for trx to be committed',
  //       'test: another hook',
  //       'people: waiting for trx to be committed',
  //       'people: another hook',
  //       'people: trx ended',
  //       'test: committed false',
  //       'people: committed false',
  //       'test: trx rolled back',
  //     ])

  //     seq = []

  //     assert.strictEqual((await app.service('people').find({ paginate: false })).length, 0)

  //     assert.deepStrictEqual(seq, [
  //       'people: waiting for trx to be committed',
  //       'people: another hook',
  //       'people: committed true',
  //       'people: trx ended',
  //     ])

  //     seq = []

  //     await app.service('test').create({})

  //     assert.deepStrictEqual(seq, [
  //       'test: waiting for trx to be committed',
  //       'test: another hook',
  //       'people: waiting for trx to be committed',
  //       'people: another hook',
  //       'people: trx ended',
  //       'test: committed true',
  //       'people: committed true',
  //       'test: trx ended',
  //     ])

  //     seq = []

  //     assert.strictEqual((await app.service('people').find({ paginate: false })).length, 1)

  //     assert.deepStrictEqual(seq, [
  //       'people: waiting for trx to be committed',
  //       'people: another hook',
  //       'people: committed true',
  //       'people: trx ended',
  //     ])
  //   })
  // })

  // describe.skip('associations', () => {
  //   const todoService = app.service('todos')

  //   it('create, query and get with associations, can unambigiously $select', async () => {
  //     const dave = await peopleService.create({
  //       name: 'Dave',
  //       age: 133,
  //     })
  //     const todo = await todoService.create({
  //       text: 'Do dishes',
  //       personId: dave.id,
  //     })

  //     const [found] = await todoService.find({
  //       paginate: false,
  //       query: {
  //         'person.age': { $gt: 100 },
  //       },
  //     })
  //     const got = await todoService.get(todo.id)

  //     assert.deepStrictEqual(
  //       await todoService.get(todo.id, {
  //         query: { $select: ['id', 'text'] },
  //       }),
  //       {
  //         id: todo.id,
  //         text: todo.text,
  //         personName: 'Dave',
  //       },
  //     )
  //     assert.strictEqual(got.personName, dave.name)
  //     assert.deepStrictEqual(got, todo)
  //     assert.deepStrictEqual(found, todo)

  //     peopleService.remove(dave.id)
  //     todoService.remove(todo.id)
  //   })
  // })

  testSuite(app, errors, 'users')
  testSuite(app, errors, 'people')
  testSuite(app, errors, 'people-customid', 'customid')
})
