# Deploying VAULT with Coolify

VAULT can be deployed in Coolify in two independent ways. Choose the option that best fits your configuration and update workflow:

- **Public Git Repository** uses the Compose file committed to the repository and the published image from GHCR.
- **Docker Compose** lets you edit the Compose configuration directly in Coolify and run the published image from GHCR.

## Option 1: Public Git Repository

1. Create a new resource in Coolify and select **Public Git Repository**.
2. Set the repository URL to `https://github.com/sizoLabs/vault`.
3. Select **Docker Compose** as the build pack. Coolify will use the [`docker-compose.yaml`](docker-compose.yaml) committed to the repository.
4. The Compose file uses `ghcr.io/sizolabs/vault:latest`. The Compose configuration cannot be edited from this resource.
5. In the resource's environment variables, set `PORT` if you need a port other than `4321`.
6. Optionally add `PUBLIC_GOOGLE_CLIENT_ID` to the environment variables as described in [Google Drive synchronization](#google-drive-synchronization).
7. Open **Domains**, add a domain or edit the existing one, and set the port to `4321` or the value configured in `PORT`.
8. Deploy the resource.

## Option 2: Docker Compose

1. Create a new **Docker Compose** resource in Coolify.
2. Copy the contents of [`docker-compose.yaml`](docker-compose.yaml) into Coolify's Compose configuration.
3. The Compose file pulls `ghcr.io/sizolabs/vault:latest`; no Git repository is required.
4. Modify the Compose configuration as needed, including the image, ports, environment variables, and health check.
5. If you keep the provided configuration, `PORT` defaults to `4321`.
6. Optionally add `PUBLIC_GOOGLE_CLIENT_ID` to the environment variables as described in [Google Drive synchronization](#google-drive-synchronization).
7. Open **Domains**, add a domain or edit the existing one, and set the port to `4321` or the value configured in `PORT`.
8. Deploy the resource.

## Google Drive synchronization

Complete these steps only if you want to enable Google Drive synchronization. Leave `PUBLIC_GOOGLE_CLIENT_ID` unset to keep synchronization disabled.

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
7. In Coolify, add the following environment variable to the deployed service:

	`PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`

8. Redeploy the service. Then, in VAULT, enable Google Drive synchronization and connect your Google account.

## Updating

- Redeploy (without cache) the resource in Coolify to pull the latest image of Vault.
- Alternatively, stop the resource and deploy it again to force Coolify to clean the cache and the image before redeploying.