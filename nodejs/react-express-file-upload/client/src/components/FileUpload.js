import React, { Fragment, useState } from 'react'
import Message from './Message'
import Progress from './Progress'
import axios from 'axios'

function FileUpload() {
    const [file, setFile] = useState('')
    const [fileName, setFileName] = useState('Choose File')
    const [uploadedFile, setUploadedFile] = useState({})
    const [message, setMessage] = useState('')
    const [uploadPercentage, setUploadPercentage] = useState(0)

    const onChange = e => {
        if (e.target.files[0]) {
            setFile(e.target.files[0])
            setFileName(e.target.files[0].name)
        }

    }

    const onSubmit = async e => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 5000,
                onUploadProgress: progressEvent => {
                    if (!file || message !== 'File Uploaded') {
                        return
                    }
                    setUploadPercentage(parseInt(Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total)
                    ))
                    setTimeout(() => {
                        setUploadPercentage(0)
                    }, 3000)
                },
            })

            const { fileName, filePath } = res.data
            setUploadedFile({ fileName, filePath })
            setMessage('File Uploaded')
        } catch (err) {
            if (err.response.status === 500) {
                setMessage('There was a problem with the server')
            } else {
                setMessage(err.response.data.msg);
            }
        }
    }

    return (
        <Fragment>
            <></>
            {message ? <Message msg={message} /> : ''}
            <form onSubmit={onSubmit}>
                <div className="input-group mb-3">
                    <input type="file" className="form-control" id="customFile" onChange={onChange} />
                    <label className="input-group-text" htmlFor="customFile">
                        {fileName}
                    </label>
                </div>
                <Progress percentage={uploadPercentage} />
                <input type="submit" value="Upload" className="btn btn-primary btn-block mt-4 w-100" />

            </form>
            {uploadedFile ? <div className="row mt-5">
                <div className="col-md-6 m-auto">
                    <h3 className="text-center">{uploadedFile.fileName}</h3>
                    <img style={{ width: '100%' }} src={uploadedFile.filePath} />
                </div>
            </div> : null}
        </Fragment>
    )
}

export default FileUpload
