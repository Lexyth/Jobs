import { RootLogger } from "./logging";

const logger = RootLogger.getLogger("Dropbox");
const authLogger = logger.getLogger("Auth");

import * as Dropbox from "dropbox";

let dropbox: Dropbox.Dropbox;
function authorize() {
  authLogger["info"]("Authorizing...");

  function parseQueryString(str: string) {
    const ret = Object.create(null);

    if (typeof str !== "string") {
      return ret;
    }

    str = str.trim().replace(/^(\?|#|&)/, "");

    if (!str) {
      return ret;
    }

    str.split("&").forEach((param) => {
      const parts = param.replace(/\+/g, " ").split("=");
      // Firefox (pre 40) decodes `%3D` to `=`
      // https://github.com/sindresorhus/query-string/pull/37
      let key = parts.shift();
      let val: string | undefined | null =
        parts.length > 0 ? parts.join("=") : undefined;

      key = decodeURIComponent(key as string);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (ret[key] === undefined) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
    });

    return ret;
  }

  function getCodeVerifier() {
    return parseQueryString(window.location.search).code;
  }

  function storeCodeVerifier(dbxAuth: Dropbox.DropboxAuth) {
    const codeVerifier = dbxAuth.getCodeVerifier();
    window.sessionStorage.setItem("codeVerifier", codeVerifier);
  }

  function doAuth(dbxAuth: Dropbox.DropboxAuth, REDIRECT_URI: string) {
    dbxAuth
      .getAuthenticationUrl(
        REDIRECT_URI,
        undefined,
        "code",
        "offline",
        undefined,
        undefined,
        true
      )
      .then((authUrl) => {
        storeCodeVerifier(dbxAuth);

        // redirect to dropbox auth site
        window.location.href = authUrl.toString();
      })
      .catch((error) => console.error(error));
  }

  function applyCodeVerifier(dbxAuth: Dropbox.DropboxAuth) {
    const codeVerifier = window.sessionStorage.getItem("codeVerifier");
    dbxAuth.setCodeVerifier(codeVerifier ?? "");
  }

  function requestToken(
    dbxAuth: Dropbox.DropboxAuth,
    REDIRECT_URI: string,
    codeVerifier: string
  ) {
    const promise = dbxAuth
      .getAccessTokenFromCode(REDIRECT_URI, codeVerifier)
      .then((response) => {
        const result = response.result as {
          access_token: string;
          refresh_token: string;
        };
        const accessToken = result.access_token;
        const refreshToken = result.refresh_token;
        return {
          accessToken,
          refreshToken,
        };
      })
      .catch((error) => {
        console.error(error.error || error);
        throw error;
      });
    return promise;
  }

  function getRefreshToken() {
    return window.localStorage.getItem("refreshToken");
  }

  function setRefreshToken(refreshToken: string | null) {
    window.localStorage.setItem("refreshToken", refreshToken ?? "");
  }

  function refreshToken(
    dbxAuth: Dropbox.DropboxAuth,
    refreshToken: string | null
  ) {
    if (!refreshToken) {
      return;
    }
    dbxAuth.setRefreshToken(refreshToken);
    dbxAuth.refreshAccessToken();
  }

  function accessDropbox(dbxAuth: Dropbox.DropboxAuth, accessToken: string) {
    dbxAuth.setAccessToken(accessToken);
    dropbox = new Dropbox.Dropbox({
      auth: dbxAuth,
    });
    authLogger["info"]("Authorized...");
  }

  authLogger.log("Authenticating...");

  const REDIRECT_URI = window.location.href.split("?")[0];
  if (REDIRECT_URI === undefined) throw new Error("REDIRECT_URI is undefined");
  const CLIENT_ID = "43pkecavqfklasz";

  const dbxAuth = new Dropbox.DropboxAuth({
    clientId: CLIENT_ID,
  });

  // TODO: restructure the refreshToken process to set a token variable and just check for that in accessPromise

  authLogger.log("Checking for refresh token...");

  const rToken = getRefreshToken();

  if (rToken) {
    refreshToken(dbxAuth, rToken);
    const token = dbxAuth.getAccessToken();
    accessDropbox(dbxAuth, token);
    return;
  }

  authLogger.log("No refresh token found...");

  authLogger.log("Checking for code verifier...");

  const codeVerifier = getCodeVerifier();

  if (!codeVerifier) {
    authLogger["info"]("Redirecting for authorization...");

    doAuth(dbxAuth, REDIRECT_URI);
    return;
  }

  authLogger.log("Code verifier found...");

  applyCodeVerifier(dbxAuth);

  const accessPromise = requestToken(dbxAuth, REDIRECT_URI, codeVerifier).then(
    (tokens) => {
      setRefreshToken(tokens.refreshToken);
      accessDropbox(dbxAuth, tokens?.accessToken);
    }
  );

  return accessPromise;
}

await authorize();

function download(
  path: string,
  type: string | undefined = "text/plain"
): Promise<File | undefined> {
  const filePromise = dropbox.filesDownload({
    path: "/" + path,
  });

  return filePromise.then(
    function (
      response: Dropbox.DropboxResponse<Dropbox.files.FileMetadata>
    ): File {
      authLogger["info"]("Downloaded:", response);

      const fileMetadata = response.result as Dropbox.files.FileMetadata & {
        fileBlob: Blob;
      };
      const file: File = new File([fileMetadata.fileBlob], fileMetadata.name, {
        type,
      });
      return file;
    },
    function (
      error: Dropbox.DropboxResponseError<Dropbox.files.DownloadError>
    ): undefined {
      authLogger["WARN"](error);
      return undefined;
    }
  );
}

function upload(
  file: File,
  mode: Dropbox.files.WriteMode = { ".tag": "overwrite" }
): Promise<boolean> {
  const statusPromise = dropbox.filesUpload({
    path: "/" + file.name,
    contents: file,
    mode,
  });

  return statusPromise.then(
    function (response: Dropbox.DropboxResponse<Dropbox.files.FileMetadata>) {
      authLogger["info"]("Uploaded:", response);
      return true;
    },
    function (error: Dropbox.DropboxResponseError<Dropbox.files.UploadError>) {
      authLogger["WARN"](error);
      return false;
    }
  );
}

export { download, upload };
