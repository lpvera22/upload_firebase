import React, { useState, useEffect } from 'react';
import {RotateLeft } from '@material-ui/icons';
import Spinner from './Spinner';
import {storage} from "./firebase/index"
import { IconButton } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const App = () => {
  const [files, setFiles] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [buttonText, setButtonText] = useState('Selecione seu arquivo primeiro');
  const [fileNameN, setfileNameN] = useState('');
  const [selectedFile, setSelectedFile] = useState()
  const [preview, setPreview] = useState([])
  const [progress, setProgress]=useState(0)
  
  // const [fileLocation, setfileLocation] = useState('');
  const[urls,setUrls]=useState([])
  
  // Handling file selection from input
  const onFileSelected = (e) => {
    e.preventDefault();
    for (let i = 0; i < e.target.files.length; i++) {
      let reader = new FileReader();

      const newFile = e.target.files[i];
      reader.onloadend=()=>{
        newFile["id"] = Math.random();
   
        setFiles(prevState => [...prevState, newFile]);
        setPreview(prevState =>[...prevState,reader.result])
        console.log(files)
      }
      reader.readAsDataURL(newFile);
    }
    
  
  //     newFile["id"] = Math.random();
  //  // add an "id" property to each File object
  //     setFiles(prevState => [...prevState, newFile]);
  //     console.log(files)
  
  
    // if (e.target.files) {
    //   setSelectedFile(e.target.files);
    //   // console.log(e.target.files)
    //   // setSelectedFile(e.target.files[0]);
    //   // setFileName(e.target.files[0].name);
      setIsDisabled(false); // Enabling upload button
      setButtonText("Upload");
      
    // }
  };

  // Setting image preview
  
  const handleReset=()=>{
    setFiles([])
    setPreview([])              
    setIsSuccess(false);
    setButtonText('Nenhum arquivo selecionado');
    setUrls([]);
  }
  // Uploading image to Cloud Storage
  const handleFileUpload = async (e) => {
    e.preventDefault();
    const promises=[];
    setIsLoading(true)
    files.forEach(file=>{
      const uploadTask = storage.ref(`images/${file.name}`).put(file);
      promises.push(uploadTask);
      uploadTask.on(
        "state_changed",
        snapshot=>{
          const p = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log('Upload is ' + p + '% done');
          setProgress(p)

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
              // console.log(urls)
              

              
            })
        }
      )
    })
    
    Promise.all(promises)
       .then(() => {
        setIsLoading(false);
        setIsSuccess(true);
        setIsLoading(false)
            // Reset to default values after 3 seconds
            // setTimeout(() => {
            //   setFiles([])
              
            //   setIsSuccess(false);
            //   setButtonText('Select your file first');
            //   setUrls([]);
            // }, 10000);
       })
       .catch(err => console.log(err.code));




    
  };

  return (
    <div className='container app'>
      <div className='row'>
      <main>
        <form style={{marginBottom:'2rem'}} onSubmit={(e) => handleFileUpload(e)}>
          <label className='uploader'>
            <div className='upload-space'>
              {isLoading ? (

                <Box position="relative" display="inline-flex">
                  <CircularProgress variant="determinate" value={progress} />
                  <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                      progress,
                    )}%`}</Typography>
                  </Box>
                </Box>
                // <Spinner />
              ) : (
                <>
                  {isError || isSuccess ? (
                    <i
                      className={`icon-${isSuccess ? 'success' : 'error'}`}
                    ></i>
                  ) : (
                    <>
                      {files.length>0 ? (
                        <ul >
                        
                          {files.map((f) => {
                            return <li style={{ listStyleType: 'none'}}>{f.name}</li>
                            // <img key={imagePreviewUrl} alt='previewImg' src={imagePreviewUrl} />
                          })}
                        </ul>
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
                {isSuccess ? 'Upload bem-sucedido!' : 'Algo deu errado ...'}
              </p>
            ) : (
              <p className='filename'>
                {files.length>0 ? <p></p> : 'Nenhum arquivo selecionado'}
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
      </div>
      {urls.length>0 ? 
        <div className='row'>
          
          <table className='table'>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">URL</th>
              
            </tr>
          </thead>
          <tbody>
          
            {urls.map((u,index)=><tr> <th scope="row">{index+1}</th><td key={index}><a href={u}></a>{u}</td></tr>)}
            
          
          </tbody>
          {/* <table className='table'>
            {urls.map((u)=><tr key={u}>{u}</tr>)}
          </table> */}
          </table>
        </div>:<p></p>}
      
      <IconButton color="primary" component="span" onClick={handleReset}>
        <RotateLeft/>
      </IconButton>
      
    </div>
  );
};

export default App;
