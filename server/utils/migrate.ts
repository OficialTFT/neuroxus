import { Database } from 'arangojs'

const ARANGO_URL = process.env.ARANGO_URL ?? 'http://localhost:8529'
const ARANGO_USER = process.env.ARANGO_USER ?? 'root'
const ARANGO_PASS = process.env.ARANGO_PASS ?? ''
const DB_NAME = process.env.DB_NAME ?? 'knowledgebase'

interface CollectionDef {
  name: string
  type: 'document' | 'edge'
}

interface IndexDef {
  collection: string
  fields: string[]
  type: 'hash' | 'skiplist' | 'persistent'
  unique?: boolean
}

const COLLECTIONS: CollectionDef[] = [
  { name: 'users', type: 'document' },
  { name: 'articles', type: 'document' },
  { name: 'article_versions', type: 'document' },
  { name: 'comments', type: 'document' },
  { name: 'notifications', type: 'document' },
  { name: 'authored', type: 'edge' },
  { name: 'article_links', type: 'edge' },
  { name: 'follows', type: 'edge' },
  { name: 'comment_on', type: 'edge' },
  { name: 'upvoted', type: 'edge' },
]

const INDEXES: IndexDef[] = [
  { collection: 'users', fields: ['email'], type: 'hash', unique: true },
  { collection: 'articles', fields: ['status'], type: 'skiplist' },
  { collection: 'articles', fields: ['authorId', 'createdAt'], type: 'skiplist' },
  { collection: 'comments', fields: ['articleId'], type: 'skiplist' },
  { collection: 'comments', fields: ['parentId', 'createdAt'], type: 'skiplist' },
  { collection: 'notifications', fields: ['userId', 'read', 'createdAt'], type: 'skiplist' },
]

async function migrate(): Promise<void> {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: 31100,
  })

  db.useBasicAuth(ARANGO_USER, ARANGO_PASS)

  console.log(`Connecting to ${ARANGO_URL}...`)

  // Create database if it doesn't exist
  const databases = await db.listDatabases()
  if (!databases.includes(DB_NAME)) {
    await db.createDatabase(DB_NAME)
    console.log(`  ✓ Created database '${DB_NAME}'`)
  } else {
    console.log(`  ✓ Database '${DB_NAME}' already exists`)
  }

  const scopedDb = db.database(DB_NAME)

  // Create collections
  for (const col of COLLECTIONS) {
    const exists = await scopedDb.collection(col.name).exists()
    if (!exists) {
      if (col.type === 'edge') {
        await scopedDb.createEdgeCollection(col.name)
      } else {
        await scopedDb.createCollection(col.name)
      }
      console.log(`  ✓ Created ${col.type} collection '${col.name}'`)
    } else {
      console.log(`  ✓ ${col.type} collection '${col.name}' already exists`)
    }
  }

  // Create indexes
  for (const idx of INDEXES) {
    const collection = scopedDb.collection(idx.collection)
    const existingIndexes = await collection.indexes()
    const alreadyExists = existingIndexes.some(
      (existing) =>
        existing.type === idx.type &&
        existing.fields &&
        existing.fields.length === idx.fields.length &&
        existing.fields.every((f, i) => f === idx.fields[i]),
    )

    if (!alreadyExists) {
      await collection.ensureIndex({
        type: idx.type,
        fields: idx.fields,
        unique: idx.unique ?? false,
        name: `idx_${idx.collection}_${idx.fields.join('_')}`,
      })
      console.log(
        `  ✓ Created ${idx.type} index on '${idx.collection}'(${idx.fields.join(', ')})${
          idx.unique ? ' [unique]' : ''
        }`,
      )
    } else {
      console.log(
        `  ✓ Index on '${idx.collection}'(${idx.fields.join(', ')}) already exists`,
      )
    }
  }

  console.log('\nMigration completed successfully.')
  process.exit(0)
}

migrate().catch((error) => {
  console.error('Migration failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
