import * as Dropbox from "dropbox";

let dropbox: Dropbox.Dropbox;
{
    function parseQueryString(str: string) {
        const ret = Object.create(null);

        if (typeof str !== 'string') {
            return ret;
        }

        str = str.trim().replace(/^(\?|#|&)/, '');

        if (!str) {
            return ret;
        }

        str.split('&').forEach((param) => {
            const parts = param.replace(/\+/g, ' ').split('=');
            // Firefox (pre 40) decodes `%3D` to `=`
            // https://github.com/sindresorhus/query-string/pull/37
            let key = parts.shift();
            let val: string | undefined | null = parts.length > 0 ? parts.join('=') : undefined;

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

    function getOldCode() {
        return window.localStorage.getItem('code');
    }

    function getNewCode() {
        return parseQueryString(window.location.search).code;
    }

    function getCode() {
        // TODO: check if old code is still valid
        const oldCode = getOldCode();
        const newCode = getNewCode();
        return oldCode ?? newCode;
    }

    function hasCode() {
        return !!getCode();
    }

    function storeCodeVerifier(dbxAuth: Dropbox.DropboxAuth) {
        const codeVerifier = dbxAuth.getCodeVerifier();
        window.localStorage.setItem("codeVerifier", codeVerifier);
    }

    function doAuth(dbxAuth: Dropbox.DropboxAuth, REDIRECT_URI: string) {
        dbxAuth.getAuthenticationUrl(REDIRECT_URI, undefined, 'code', 'offline', undefined, undefined, true)
            .then(authUrl => {
                storeCodeVerifier(dbxAuth);

                // redirect to dropbox auth site
                window.location.href = authUrl.toString();
            })
            .catch((error) => console.error(error));
    };

    function applyCodeVerifier(dbxAuth: Dropbox.DropboxAuth) {
        const codeVerifier = window.localStorage.getItem("codeVerifier");
        dbxAuth.setCodeVerifier(codeVerifier ?? "");
    }

    function requestToken(dbxAuth: Dropbox.DropboxAuth, REDIRECT_URI: string, code: string) {
        const promise = dbxAuth.getAccessTokenFromCode(REDIRECT_URI, code)
            .then((response: any) => {
                const accessToken = response.result.access_token;
                const refreshToken = response.result.refresh_token;
                return {
                    accessToken,
                    refreshToken
                };
            })
            .catch((error) => {
                console.error(error.error || error);
            });
        return promise;
    }

    function getRefreshToken() {
        return window.localStorage.getItem("refreshToken");
    }

    function hasRefreshToken() {
        return !!getRefreshToken();
    }

    function refreshToken(dbxAuth: Dropbox.DropboxAuth) {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            return;
        }
        dbxAuth.setRefreshToken(refreshToken);
        dbxAuth.refreshAccessToken();
    }

    function accessDropbox(dbxAuth: Dropbox.DropboxAuth, accessToken: any) {
        dbxAuth.setAccessToken(accessToken);
        dropbox = new Dropbox.Dropbox({
            auth: dbxAuth
        });
        console.log("Success");
    }

    // TODO: somewhere here there might be flaws; but it's good enough for now
    function auth() {
        console.log("Authenticating");

        var REDIRECT_URI = 'http://localhost:3000/Jobs/';
        var CLIENT_ID = '43pkecavqfklasz';

        var dbxAuth = new Dropbox.DropboxAuth({
            clientId: CLIENT_ID,
        });

        if (hasRefreshToken()) {
            refreshToken(dbxAuth);
            const token = dbxAuth.getAccessToken();
            accessDropbox(dbxAuth, token);
            return;
        }

        if (!hasCode()) {
            doAuth(dbxAuth, REDIRECT_URI);
            return;
        }

        const code = getCode();

        applyCodeVerifier(dbxAuth);

        const accessPromise = requestToken(dbxAuth, REDIRECT_URI, code).then(tokens => {
            if (tokens?.refreshToken) {
                window.localStorage.setItem("refreshToken", tokens.refreshToken);
            }
            accessDropbox(dbxAuth, tokens?.accessToken);
        });

        return accessPromise;
    }

    await auth();
};

function download(path: string): Promise<File | undefined> {
    const filePromise = dropbox.filesDownload({
        path: "/" + path
    });

    return filePromise.then(
        function (response: Dropbox.DropboxResponse<Dropbox.files.FileMetadata>): File {
            console.log(response);
            const fileMetadata = response.result;
            const file: File = new File([(<any>fileMetadata).fileBinary], fileMetadata.name, { type: "text/csv" });
            return file;
        },
        function (error: Dropbox.DropboxResponseError<Dropbox.files.DownloadError>): undefined {
            console.log(error);
            return undefined;
        }
    );
}

function upload(file: File): Promise<boolean> {
    const statusPromise = dropbox.filesUpload({
        path: "/" + file.name,
        contents: file
    });

    return statusPromise.then(
        function (response: Dropbox.DropboxResponse<Dropbox.files.FileMetadata>) {
            console.log(response);
            return true;
        },
        function (error: Dropbox.DropboxResponseError<Dropbox.files.UploadError>) {
            console.log(error);
            return false;
        }
    )
}

export { download, upload };