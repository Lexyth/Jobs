import { download, upload } from "./dropbox";

// TODO: implement local storage with file system access API

export function load(path: string) {
  const file = download(path);

  const textPromise = file.then((file) => {
    return file?.text();
  });
  return textPromise;
}

export function save(
  path: string,
  content: string,
  type: string = "text/plain"
) {
  const file = new File([content], path, { type });
  return upload(file);
}
