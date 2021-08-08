import React from 'react'
import {Link} from 'react-router-dom'

function Footer() {
    return (
        <footer>
            <p>CopyRight &copy; 2021</p>
            <Link to='/about'>about</Link>
        </footer>
    )
}

export default Footer
