import { render, screen, cleanup } from '@testing-library/react'
import Users from '../Users'
import renderer from "react-test-renderer"

// test("should render Users component", () => {
//     render(<Users />) 
//     const userElement = screen.getByTestId("user-1")
//     expect(userElement).toBeInTheDocument()
//     expect(userElement).toHaveTextContent("Hi")
// })

afterEach(() => {
    cleanup()
})

test("Should render illegal user", () => {
    const user = { id: 1, name: "John", age: 15 }

    render(<Users user={user} />)

    const userElement = screen.getByTestId("user-1")
    expect(userElement).toBeInTheDocument()
    expect(userElement).toHaveTextContent("John")

    expect(userElement).toContainHTML("red")
})

test("matches snapshots", () => {
    const user = { id: 1, name: "John", age: 15 }
    const tree = renderer.create(<Users user={user} />).toJSON()
    expect(tree).toMatchSnapshot()
})