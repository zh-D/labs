import { useQuery } from 'react-query'

const Users = () => {
    const { isLoading, isFetching, error, data, status } = useQuery('Users', () =>
        fetch('https://jsonplaceholder.typicode.com/users').then(res =>
            res.json()
        )
    )

    console.log(isFetching);
    console.log(isLoading);
    console.log(error);
    console.log(data);

    if (isLoading) {
        return <p>Loading...</p>
    }

    return (
        <div>
            <h1>Welcome to React Query 3</h1>
            {isFetching && "Background Updating"}
            {/* {isLoading && "Loading..."} */}
            {error && error.message}
            {data && data.map(user => <h1 key={user.id}>{user.name}</h1>)}
        </div>
    )
}

export default Users