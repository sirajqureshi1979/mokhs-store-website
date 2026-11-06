# Publish MOKHS.STORE with GitHub Pages

Repository: https://github.com/sirajqureshi1979/mokhs-store

The site should be published at **https://www.mokhs.store/**.

## Put the app at the repository root

The current GitHub upload places the app inside `mokhs.store-–-smart-electronics-pakistan/`. GitHub Pages will not discover its workflow there. Move the *contents* of that folder to the repository root, including the hidden `.github` folder. The root must contain `package.json`, `src/`, `public/`, and `.github/workflows/deploy.yml`.

Then commit and push those root-level files to the `main` branch. Do not upload `.env` files or API keys.

## Configure Pages

1. Open https://github.com/sirajqureshi1979/mokhs-store/settings/pages.
2. Set **Build and deployment** source to **GitHub Actions**.
3. Ensure the custom domain is `www.mokhs.store`.
4. After the first successful deployment and certificate provisioning, enable **Enforce HTTPS**.

## Configure DNS

At your domain registrar, set this record:

| Type | Host | Value |
|---|---|---|
| `CNAME` | `www` | `sirajqureshi1979.github.io` |

The current `www` record points to `sirajwuhan-bot.github.io`; replace it. If you also want the apex `mokhs.store` to redirect to `www`, keep the four GitHub Pages A records on `@` (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and remove the unrelated `160.153.0.224` A record.

## Deployment

Once the app files and workflow are at the repository root, each push to `main` builds with `npm install` and `npm run build`, then deploys `dist/` to GitHub Pages. The CNAME file in `public/` sets the deployed hostname to `www.mokhs.store`.
