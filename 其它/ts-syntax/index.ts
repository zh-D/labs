// Baisc Types
let id: number = 5
let company: string = 'asd'
let x: any = 'Hello'
let age: number

let ids: number[] = [1, 2, 3, 4, 5]
let arr: any[] = [1, 'h', 2, true]

// Tuple
let person: [number, string, boolean] = [1, 'Brad', true]

// Tuple Array
let employee: [number, string][]

employee = [
    [1, 'Brad'],
    [2, 'John'],
    [3, 'Jill'],
]


// Union
let pid: string | number = 22
pid = '22'

//Enum
enum Direction1 {
    Up = 1,// 0 by default
    Down,
    Left,
    Right
}

enum Direction2 {
    Up = 'letf',// 0 by default
    Down = 'Down',
    Left = 'Left',
    Right = 'Right'
}

// Object
type User = {
    id: number,
    name: string
}
const user: User = {
    id: 1,
    name: 'John'
}

// Type Assertion
let cid: any = 1
// let customerId = <number>cid
let customerId = cid as number

// Functions
function addNum(x: number, y: number): number {
    return x + y
}

console.log(addNum(1, 2));

// Interface
interface UserInterface {
    readonly id: number,
    name: string,
    age?: number // option
}
const user1: UserInterface = {
    id: 1,
    name: 'John'
}

// Interface can't be used in Union
// interface Point = number | string X
type Point = number | string
const p1: Point = 1

interface MathFunc {
    (x: number, y: number): number
}

const add: MathFunc = (x: number, y: number): number => x + y

// Class
interface PersonInterface {
    id: number,
    name: string,
    register(): string
}

class Person implements PersonInterface {
    id: number
    name: string

    constructor(id: number, name: string) {
        this.id = id
        this.name = name
    }

    register() {
        return `${this.id} is now registered`
    }
}

const brad = new Person(1, 'brad')
brad.register()

// subclass
class Employee extends Person {
    position: string
    constructor(id: number, name: string, position: string) {
        super(id, name)
        this.id = id
        this.position = position
    }
}

const emp = new Employee(3, 'Sha', 'Developer')

console.log(emp.register());

// Generic
function getArray<T>(items: T[]): T[] {
    return new Array().concat(items)
}

let numArray = getArray<number>([1, 2, 3, 4])
let strArray = getArray<string>(['brad', 'John', 'Jill'])

numArray.push(5)

// tsx
// export interface Props {
//     title: string,
//     color?: string
// }
// const Header = (props: Props) {
//     return (
//         { props.title }
//     )
// }