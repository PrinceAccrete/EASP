import { useState } from "react";
import { Button } from "primereact/button";

const FileUploader = ({ file, onFileSelect, onFileRemove, update,updateImage }) => {
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (onFileSelect) onFileSelect(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (onFileSelect) onFileSelect(droppedFile);
    }
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return "";
    const parts = url.split("/");
    return parts[parts.length - 1];
};




  return (
    <div
      className={`w-full mx-auto p-2 border border-gray-200 rounded-lg bg-white ${
        dragging ? "border-blue-400 bg-blue-50" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {!file && (
        <label className="flex flex-1 flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition text-center">
          <span className="text-gray-600 text-sm">Drag & Drop or Click to Upload</span>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
        
      )}

      {file && (
        <div className="flex flex-wrap items-center w-full p-3 border justify-between border-slate-200 rounded-lg">

          {update && updateImage && (
            <img
              src={updateImage}
              alt="preview"
              className="w-14 h-14 object-contain rounded-md border"
            />
          )}

          {file?.type?.startsWith("image") && !update && (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-14 h-14 object-contain rounded-md border"
            />
          )}

          {file?.type?.startsWith("image") && !update && (
            <div className="ml-4 flex-1 min-w-[120px]">
              <p className="text-gray-800 font-medium truncate mb-0">{file.name}</p>
              <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(2)} KB • {file?.type?.toUpperCase()}
            </p>
              </div>)}

          <Button
            icon="pi pi-times"
            className="p-button-text text-red-400 hover:text-red-500"
            onClick={() => {
              onFileRemove()
              update = false
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUploader;  