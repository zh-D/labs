const axios = require("axios")

const fetchUsers = () => axios.get("https://jsonplaceholder.typicode.com/users").then(res => res.data).catch(err => console.log(err))

module.exports = fetchUsers