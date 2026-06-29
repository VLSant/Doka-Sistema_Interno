import { useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import { Button } from "../../../components/ui/Button";
import type { ImportProgress } from "../types";
import "./FileDropzone.css";

export interface FileDropzoneProps {
  disabled?: boolean;
  progress?: ImportProgress | null;
  error?: string | null;
  onSelect: (file: File) => void;
  onCancel?: () => void;
}

export function FileDropzone({
  disabled = false,
  progress,
  error,
  onSelect,
  onCancel,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const choose = (file?: File) => {
    if (!disabled && file) onSelect(file);
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => choose(event.target.files?.[0]);
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files[0]);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <section className="mms-file-section" aria-labelledby="mms-file-title">
      <h2 id="mms-file-title">Selecione a planilha MMS</h2>
      <div
        className={`mms-file-dropzone${dragging ? " mms-file-dropzone--dragging" : ""}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="mms-file-dropzone__input"
          type="file"
          accept=".csv,.xlsx"
          disabled={disabled}
          onChange={handleChange}
          aria-label="Arquivo MMS"
        />
        <strong>Arraste o arquivo aqui ou clique para selecionar</strong>
        <span>CSV ou XLSX, até 25 MiB</span>
      </div>
      {progress ? (
        <div className="mms-progress" role="status" aria-live="polite">
          <span>{progress.message}</span>
          <progress max={progress.total} value={progress.current} />
        </div>
      ) : null}
      {error ? <p className="mms-file-error" role="alert">{error}</p> : null}
      {disabled && onCancel ? (
        <Button variant="outline" onClick={onCancel}>Cancelar tentativa</Button>
      ) : null}
    </section>
  );
}
