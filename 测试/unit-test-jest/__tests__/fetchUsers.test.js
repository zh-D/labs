const fetchUsers = require('../fetchUsers')

test("Username should return Bret", async() => {
    const data = await fetchUsers()
    expect(data[0].username).toEqual("Bret")
})

