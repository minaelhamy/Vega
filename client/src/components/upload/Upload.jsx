import React, { useState } from "react";

const Upload = ({ setImg, setUploadStatus, chatId }) => {
  const [progress, setProgress] = useState(0);

const authenticator = async () => {
  try {
    const response = await fetch("https://vega.pulsarapps.com/api/upload");

    setImg((prev) => ({ ...prev, isLoading: true }));
    setProgress(0);
    console.log('Starting file upload...');

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${import.meta.env.VITE_API_URL}/api/upload-csv`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
          console.log(`Upload progress: ${percentComplete}%`);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setImg((prev) => ({
            ...prev,
            isLoading: false,
            dbData: response.dbData,
            aiData: response.aiData,
          }));
          setUploadStatus({ progress: 100, success: response.success, filename: response.filename });
          console.log('File uploaded successfully:', response.filename);
        } else {
          setImg((prev) => ({ ...prev, isLoading: false, error: "Upload failed!" }));
          setUploadStatus({ progress: 0, success: false, filename: "" });
          console.error('Upload failed:', xhr.responseText);
        }
      };

      xhr.send(formData);
    } catch (err) {
      setImg((prev) => ({ ...prev, isLoading: false, error: "Upload failed!" }));
      setUploadStatus({ progress: 0, success: false, filename: "" });
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="upload">
      <label htmlFor="file">
        <img src="/upload.png" alt="Upload" />
      </label>
      <input id="file" type="file" multiple={false} hidden onChange={handleChange} />
      {progress > 0 && <progress value={progress} max="100">{progress}%</progress>}
    </div>
  );
};

export default Upload;