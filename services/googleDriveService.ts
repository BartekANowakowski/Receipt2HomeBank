
// Service to handle Google Drive Uploads using Google Identity Services

// Types for global google objects
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const uploadToGoogleDrive = async (
  content: string,
  fileName: string,
  clientId: string,
  onStatus: (msg: string) => void
): Promise<string> => {
  if (!clientId) {
    throw new Error("Brak Client ID w ustawieniach.");
  }

  return new Promise((resolve, reject) => {
    // 1. Initialize Token Client
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          reject(tokenResponse);
          return;
        }

        const accessToken = tokenResponse.access_token;
        onStatus("Wysyłanie pliku...");

        try {
          // 2. Prepare Multipart Upload
          const fileMetadata = {
            name: fileName,
            mimeType: 'text/csv'
          };

          const boundary = 'foo_bar_baz';
          const delimiter = "\r\n--" + boundary + "\r\n";
          const close_delim = "\r\n--" + boundary + "--";

          const contentType = 'text/csv';
          
          const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n\r\n' +
            content +
            close_delim;

          // 3. Perform Upload Request
          const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + accessToken,
              'Content-Type': 'multipart/related; boundary=' + boundary
            },
            body: multipartRequestBody
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(`Upload failed: ${errData.error?.message || response.statusText}`);
          }

          const result = await response.json();
          onStatus("Zapisano pomyślnie!");
          resolve(result.id);

        } catch (err: any) {
          reject(err);
        }
      },
    });

    // 4. Request Access Token (Trigger Popup)
    onStatus("Autoryzacja Google...");
    client.requestAccessToken();
  });
};
