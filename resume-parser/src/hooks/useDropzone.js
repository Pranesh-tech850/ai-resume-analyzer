import { useEffect, useRef, useState } from "react";

// Drag-and-drop plus click-to-browse behaviour for any drop zone.
// Returns props to spread onto the zone and the hidden file input.
export function useDropzone({ onFile }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Stop the browser opening a file dropped outside the zone.
    const block = (e) => e.preventDefault();
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  const openPicker = () => inputRef.current?.click();

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    onFile?.(e.dataTransfer.files[0]);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };
  const handleInputChange = (e) => {
    onFile?.(e.target.files[0]);
    e.target.value = ""; // lets the same file be picked again
  };

  return {
    isDragging,
    dropzoneProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onClick: openPicker,
      onKeyDown: handleKeyDown,
      role: "button",
      tabIndex: 0,
    },
    inputProps: {
      ref: inputRef,
      type: "file",
      className: "hidden",
      onChange: handleInputChange,
    },
  };
}
