const object = {
    user: () => {
        const user = { name: "John", age: 18 }
        return user
    },
    filterByTerm: (inputArray, searchTerm) => {
        return inputArray.filter((arrayElement) => {
            return arrayElement.url.match(searchTerm)
        })
    }
}


module.exports = object