const calculator = require("../calculator")

describe("calculator tests", () => {
    // add
    test("adding 1 + 2 should return 3", () => {
        expect(calculator.sum(1, 2)).toBe(3)
    })

    // diff
    test("2 - 2 should NOT return 1", () => {
        expect(calculator.diff(2, 2)).not.toBe(1)
    })

    // null
    test("Should return null", () => {
        expect(calculator.isNull()).toBeNull()
    })

    // falsy / truthy
    test("Should return falsy", () => {
        expect(calculator.checkValue(0)).toBeFalsy()
        expect(calculator.checkValue(null)).toBeFalsy()
        expect(calculator.checkValue(undefined)).toBeFalsy()
        expect(calculator.checkValue("hi")).toBeTruthy()
    })

    // less/greater
    test("Should be less/greater then 100", () => {
        const num1 = 50
        const num2 = 60
        expect(num1 + num2).toBeLessThan(120)
        expect(num1 + num2).toBeLessThanOrEqual(110)
        expect(num1 + num2).toBeGreaterThanOrEqual(100)
    })

    // Regex
    test("Should be character i in ice cream", () => {
        // test fro success match
        // expect("ice cream").toMatch(/i/)
        // expect("ice cream").toMatch(/I/i)
        expect("ce cream").toMatch(/e/)

        // test for failure match
        // expect("hi").not.toMatch(/hi/)
        expect("hi").not.toMatch(/hello/)
    })

    // Array
    test("Jest should be in array", () => {
        array = ["Test", "Jest", "JavaScript"]
        expect(array).toContain("Test")
    })
})