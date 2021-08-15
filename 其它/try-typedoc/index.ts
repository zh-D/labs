/**
 * This function returns the sum of two numbers
 * 
 * @param a first number
 * @param b second number
 * @returns a total of two numbers
 */
function mySum(a: number, b: number) {
    return a + b;
}

mySum(10, 20)


/**
 * This function returns the sum of three numbers and one number is optional
 * 
 * @returns a total of two numbers
 */
let calTotal: (a: number, b: number, c?: number) => number

calTotal = (num1: number, num2: number) => {
    return num1 + num2
}

calTotal(10, 20)

/**
 * This class greets new customers
 */
class Greeter {
    /**
     * This function points out "hi"
     */
    public greet() {
        console.log('hi');
    }

    public username: string = "JK"

    /**
     * Function to greet a new user
     * 
     * @param username the name of a new user
     * @returns a new user's name
     */
    public greetNewUser(username: string) {
        this.username = username

        return this.username
    }
}

const g = new Greeter()
g.greet()

g.greetNewUser("John")
