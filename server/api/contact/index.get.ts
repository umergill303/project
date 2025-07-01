// export default defineEventHandler(async event => {
//   try {
//     const db = useDb()
//     const query = getQuery(event)
//     const page = Number(query.page)
//     const limit = Number(query.limit)
//     const offset = (page - 1) * limit

//     const contacts = await db.select().from(tables.contacts)
//       .orderBy(asc(tables.contacts.createdAt)).limit(limit).offset(offset)

//     const totalContacts = await db
//       .select({ count: sql<number>`COUNT(*)` })
//       .from(tables.contacts)
//       .then(res => res[0]?.count ?? 0)

//     return { contacts, totalContacts }
//   }
//   catch {
//     console.log('Api Error Contacts')
//   }
// })
export default defineEventHandler(async event => {
  try {
    const db = useDb()
    const query = getQuery(event)
    const page = Number(query.page)
    const limit = Number(query.limit)
    const offset = (page - 1) * limit
    const unreadOnly = query.unread === 'true'

    const baseQuery = db.select().from(tables.contacts)
    const filteredQuery = unreadOnly ? baseQuery.where(eq(tables.contacts.unread, true)) : baseQuery

    const contacts = await filteredQuery
      .orderBy(asc(tables.contacts.createdAt))
      .limit(limit)
      .offset(offset)

    const totalContacts = await (unreadOnly
      ? db.select({ count: sql<number>`COUNT(*)` }).from(tables.contacts).where(eq(tables.contacts.unread, true))
      : db.select({ count: sql<number>`COUNT(*)` }).from(tables.contacts))
      .then(res => res[0]?.count ?? 0)

    return { contacts, totalContacts }
  }
  catch {
    console.log('Api Error Contacts')
    return { contacts: [], totalContacts: 0 }
  }
})
