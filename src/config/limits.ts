export const UPLOAD_LIMITS = {
    MAX_FILES: 20,
    MAX_FILE_SIZE_MB: 50,
    get MAX_FILE_SIZE_BYTES() {
        return this.MAX_FILE_SIZE_MB * 1024 * 1024;
    }
};
