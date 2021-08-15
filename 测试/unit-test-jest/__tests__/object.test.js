const object = require("../object")

// String and Obj comperation should use toEqual
test("User should return object", () => {
    expect(object.user()).toEqual({ name: "John", age: 18 })
})

describe("Filter function", () => {
    test("it should filter by a search term - link", () => {
        const input = [
            { id: 1, url: "https://www.url1.com" },
            { id: 2, url: "https://www.url2.com" },
            { id: 3, url: "https://www.website.com" },
        ]

        const output = [{ id: 3, url: "https://www.website.com" }]

        expect(object.filterByTerm(input, "website")).toEqual(output)

    })
})