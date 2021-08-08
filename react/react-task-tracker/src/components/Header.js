import React from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router'
import Button from './Button'

function Header({ title, onAdd, showAdd }) {
    const location = useLocation()
    return (
        <header className='header'>
            <h1 style={headingStyle}>{title}</h1>
            {location.pathname === '/' && <Button color={showAdd ? 'red' : 'green'} text={showAdd ? 'Close' : 'Add'} onClick={onAdd} />}
        </header>
    )
}

Header.defaultProps = {
    title: 'Task Tracker'
}

Header.propTypes = {
    title: PropTypes.string
}

const headingStyle = {}

export default Header
