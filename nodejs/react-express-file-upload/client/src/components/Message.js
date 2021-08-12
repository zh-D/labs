import React from 'react'

function Message({ msg }) {
    return (

        <div>
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
                {msg}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>

    )
}

export default Message
