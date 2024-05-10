// Integrate with the dropbox api to upload and download files

import { Dropbox } from "dropbox";

console.log(import.meta.env.VITE_DROPBOX_ACCESS_TOKEN);

const dropbox = new Dropbox({
    accessToken: import.meta.env.VITE_DROPBOX_ACCESS_TOKEN
});

function download(path: string) {
    return dropbox.filesDownload({
        path
    });
}

function upload(file: File) {
    return dropbox.filesUpload({
        path: "" + file.name,
        contents: file
    });
}

function list(path: string) {
    console.log("Listing for " + path);
    return dropbox.filesListFolder({
        path: "" + path
    });
}

export { dropbox, download, upload, list };