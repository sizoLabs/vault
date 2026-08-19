# Deploying VAULT with Coolify

## Initial deployment

1. Create a new resource in Coolify and select **Public Git Repository**.

2. Set the repository URL to `https://github.com/sizoLabs/vault` and select **Docker Compose** as the build pack.

3. To enable **Google Drive** synchronization, follow the [Google OAuth configuration](#configuring-google-oauth) steps below and add the resulting Client ID to the `PUBLIC_GOOGLE_CLIENT_ID` environment variable. Leave this variable unset to keep Google Drive synchronization disabled.

4. Configure the domain and set the service port to `4321`.

5. Deploy the resource.

## Configuring Google OAuth

Complete these steps only if you want to enable Google Drive synchronization.

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create a project on the [project creation page](https://console.cloud.google.com/projectcreate).
2. Select the new project, open the [API Library](https://console.cloud.google.com/apis/library), search for **Google Drive API**, and click **Enable**.
3. Open **Google Auth Platform** from the Google Cloud navigation menu, or go to the [Google Auth Platform setup](https://console.cloud.google.com/auth/branding). Configure the app:
	- Choose **External** unless the app is restricted to a Google Workspace organization.
	- Enter an app name and a support email.
	- Add the deployed site's domain as an authorized domain, for example `example.com`.
	- Add your email as a developer contact.
	- If the app is in testing, add the Google accounts that will use it as test users.
4. Open the [Credentials page](https://console.cloud.google.com/apis/credentials) and click **Create credentials** > **OAuth client ID**.
5. Select **Web application** as the application type. Under **Authorized JavaScript origins**, add the complete deployed origin, for example `https://example.com`. Do not include a path or trailing slash. VAULT uses a browser-based token flow, so no redirect URI is required.
6. Click **Create** and copy the generated **Client ID**. It ends in `.apps.googleusercontent.com`. This is the public ID; do not use the client secret.
7. In Coolify, add the following environment variable to the Docker Compose service:

	`PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`

8. Redeploy the service. Then, in VAULT, enable Google Drive synchronization and connect your Google account.

## Updating

To update an existing deployment:

1. Stop the service.
2. Deploy it again with the cache disabled (**Deploy without cache**).
