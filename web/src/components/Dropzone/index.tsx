import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi'

import './styles.css';

interface Props {
    onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => {
    const [selectedFileUrl, setSelecteFileUrl] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        //Como só tem um arquivo/foto por comércio sempre vai estar na posição 0
        const file = acceptedFiles[0];

        const fileUrl = URL.createObjectURL(file);

        setSelecteFileUrl(fileUrl);
        onFileUploaded(file);
    }, [onFileUploaded])

    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        accept: 'image/*'
    });

    return (
        <div className="dropzone" { ...getRootProps() }>
            <input {...getInputProps() } accept="image/*" />
            {selectedFileUrl
                ? <img src={selectedFileUrl} alt="Point thumbnail" />
                : (
                    <p>
                        <FiUpload />
                        Imagem do estabelecimento
                    </p>
                )
            }
            
        </div>
    )
}

export default Dropzone;