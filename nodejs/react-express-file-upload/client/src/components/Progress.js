import React from 'react'
import PropTypes from 'prop-types'

function Progress({ percentage }) {
    return (
        <div className="progress">
            <div className="progress-bar progress-bar-striped bg-success"
                role="progressbar"
                style={{ width: `${percentage}%` }}
            >
                {percentage}%
            </div>
        </div>
    )
}

export default Progress

Progress.protoTypes = {
    percentage: PropTypes.number.isRequired
}