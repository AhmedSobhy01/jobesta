export class FileUploadError extends Error {
  name: string;
  errors: { [key: string]: string };

  constructor(message: string, errors: { [key: string]: string }) {
    super(message);

    this.name = 'FileUploadError';
    this.errors = errors;
  }
}
