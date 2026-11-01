export class FileDownloadManager {
  static download(blob: Blob, fileName: string): void {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    try {
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    } finally {
      link.remove();
      URL.revokeObjectURL(url);
    }
  }

  static decodeBase64(base64: string, mimeType: string): Blob {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return new Blob([bytes], { type: mimeType });
  }
}
