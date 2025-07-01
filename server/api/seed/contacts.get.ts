export default defineEventHandler(async () => {
  // Get existing users
  const users = await useDb().select().from(tables.users).limit(20)
  if (!users.length) {
    return { error: 'No users found. Please create users first.' }
  }

  const fakeContacts = []

  const names = ['Ali Khan', 'Sara Ahmed', 'Usman Tariq', 'Fatima Zain', 'Hamza Iqbal']
  const subjects = ['Support Request', 'Product Inquiry', 'Feedback', 'Complaint', 'General Question']
  const messages = [
    'I would like to know more about your services.',
    'Please help me with my recent order.',
    'Great job on the latest update!',
    'I am facing an issue with my account.',
    'Can I get a refund for my last purchase?'
  ]

  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const fullName = names[Math.floor(Math.random() * names.length)]
    const [firstName, lastName] = fullName.split(' ')
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
    const phone = 3000000000 + Math.floor(Math.random() * 999999999)
    const subject = subjects[Math.floor(Math.random() * subjects.length)]
    const message = messages[Math.floor(Math.random() * messages.length)]
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()

    const contact: typeof tables.contacts.$inferInsert = {
      id: uuid4(),
      user: user.id,
      unread: Math.random() > 0.5,
      name: fullName,
      email,
      phone,
      subject,
      message,
      createdAt
    }

    await useDb().insert(tables.contacts).values(contact)
    fakeContacts.push(contact)
  }

  return {
    success: true,
    count: fakeContacts.length,
    sample: fakeContacts[0]
  }
})
