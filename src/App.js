import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import {storage} from "./firebase/index"
const App = () => {
  const [files, setFiles] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [buttonText, setButtonText] = useState('Select your file first');
  const [fileNameN, setfileNameN] = useState('');
  // const [fileLocation, setfileLocation] = useState('');
  const[urls,setUrls]=useState([])
  // Handling file selection from input
  const onFileSelected = (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const newFile = e.target.files[i];
      newFile["id"] = Math.random();
   // add an "id" property to each File object
      setFiles(prevState => [...prevState, newFile]);
      console.log(files)
    }
  
    // if (e.target.files) {
    //   setSelectedFile(e.target.files);
    //   // console.log(e.target.files)
    //   // setSelectedFile(e.target.files[0]);
    //   // setFileName(e.target.files[0].name);
      setIsDisabled(false); // Enabling upload button
      setButtonText("Let's upload this!");
      
    // }
  };

  // Setting image preview
  useEffect(() => {
    if (files) {
      // const reader = new FileReader();
      // reader.onloadend = () => setPreview(reader.result);

      // reader.readAsDataURL(selectedFile);
    }
  }, [files]);

  // Uploading image to Cloud Storage
  const handleFileUpload = async (e) => {
    e.preventDefault();
    const promises=[];
    files.forEach(file=>{
      const uploadTask = storage.ref(`images/${file.name}`).put(file);
      promises.push(uploadTask);
      uploadTask.on(
        "state_changed",
        snapshot=>{
          

        },
        error=>{
          console.log(error);
        },
        ()=>{
          storage
            .ref("images")
            .child(file.name)
            .getDownloadURL()
            .then(url=>{
              // setfileNameN(res.data.fileName)
              setUrls(prevState => [...prevState, url]);
              console.log(urls)
              

              
            })
        }
      )
    })
    
    Promise.all(promises)
       .then(() => {
        setIsLoading(false);
            setIsSuccess(true);
    
            // Reset to default values after 3 seconds
            setTimeout(() => {
              setFiles([])
              
              setIsSuccess(false);
              setButtonText('Select your file first');
              setUrls([]);
            }, 10000);
       })
       .catch(err => console.log(err.code));




    // setIsLoading(true);
    // setIsDisabled(true);
    // setButtonText("Wait we're uploading your file...");

    // console.log('images====>',files)

    // const uploadTask = storage.ref(`images/${selectedFile[0].name}`).put(selectedFile[0])
    // uploadTask.on(
    //   "state_changed",
    //   snapshot=>{},
    //   error=>{
    //     console.log(error);
    //   },
    //   ()=>{
    //     storage
    //       .ref("images")
    //       .child(selectedFile[0].name)
    //       .getDownloadURL()
    //       .then(url=>{
    //         // setfileNameN(res.data.fileName)
    //         setfileLocation(url)

    //         setIsLoading(false);
    //         setIsSuccess(true);
    //         console.log('download url',url)
    //       })
    //   }
    // )
    // try {
    //   if (selectedFile !== '') {
        
    //     // Creating a FormData object
    //     let fileData = new FormData();

    //     // Adding the 'image' field and the selected file as value to our FormData object
    //     // Changing file name to make it unique and avoid potential later overrides
        
    //     for (let i = 0; i < selectedFile.length; i++) {
          
    //       fileData.append('image', selectedFile[i],`${Date.now()}${selectedFile[i].name}`)
    //     }
    //     console.log('fileDa',fileData)

    //     // fileData.set(
    //     //   'image',
    //     //   selectedFile,
    //     //   `${Date.now()}-${selectedFile.name}`
    //     // );
        
    //     let res =await axios({
    //       method: 'post',
    //       url: 'https://apinode-bc32a.web.app:8080/api/upload',
    //       data: fileData,
    //       headers: { 'Content-Type': 'multipart/form-data' },
    //     });
    //     console.log('RESPONSE------->',res.data.fileLocation)
    //     setfileNameN(res.data.fileName)
    //     setfileLocation(res.data.fileLocation)

    //     setIsLoading(false);
    //     setIsSuccess(true);

    //     // Reset to default values after 3 seconds
    //     setTimeout(() => {
    //       setSelectedFile(null);
    //       setPreview(null);
    //       setIsSuccess(false);
    //       setFileName(null);
    //       setButtonText('Select your file first');
    //     }, 3000);
    //   }
    // } catch (error) {
    //   setIsLoading(false);
    //   setIsError(true);
    //   setFileName(null);

    //   setTimeout(() => {
    //     setIsError(false);
    //     setButtonText('Select your file first');
    //   }, 3000);
    // }
  };

  return (
    <div className='app'>
      <header className='title'>
        <h1>Upload a file to Firebase Cloud Storage</h1>
      </header>
      <main>
        <form onSubmit={(e) => handleFileUpload(e)}>
          <label className='uploader'>
            <div className='upload-space'>
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  {isError || isSuccess ? (
                    <i
                      className={`icon-${isSuccess ? 'success' : 'error'}`}
                    ></i>
                  ) : (
                    <>
                      {preview ? (
                        <div className='preview'>
                          <img
                            src={preview}
                            alt='Preview of the file to be uploaded'
                          />
                        </div>
                      ) : (
                        <i className='icon-upload'></i>
                      )}
                      <input type='file'  multiple="multiple" onChange={onFileSelected} />
                    </>
                  )}
                </>
              )}
            </div>
            {isError || isSuccess ? (
              <p className={isSuccess ? 'success' : 'error'}>
                {isSuccess ? 'Upload successful!' : 'Something went wrong ...'}
              </p>
            ) : (
              <p className='filename'>
                {fileName ? fileName : 'No file selected yet'}
              </p>
            )}
          </label>

          <button
            type='submit'
            className='btn'
            disabled={isDisabled}
            tabIndex={0}
          >
            {buttonText}
          </button>
        </form>
      </main>

        {urls}
      
    </div>
  );
};

export default App;
