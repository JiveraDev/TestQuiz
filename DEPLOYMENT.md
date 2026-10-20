# Deploy the IT 401 Cybercrime Offences Reviewer

The reviewer is a static website. Deploy the existing `quiz-reviewer/dist/` folder; it already contains the complete application. No build command, database, environment variables, or Node.js server is needed on the host.

## Publish to your Hostinger subdomain

These steps use Hostinger Web or Cloud hosting with hPanel and File Manager. The upload package is `quiz-reviewer/it401-hostinger.zip`.

1. In hPanel, open **Websites → Dashboard** for the website hosting your domain. Search for **Subdomains** in the sidebar. Find your existing subdomain, or create one such as `quiz.yourdomain.com`, and note the folder mapped to it. Hostinger's default is commonly a folder such as `public_html/quiz`; use the actual directory shown for your subdomain.
2. Open **File Manager** for that website and navigate to the subdomain's mapped directory.
3. Upload `it401-hostinger.zip`, then right-click it and select **Extract**. If extraction creates another folder, move its contents into the subdomain directory so `index.html` sits directly inside the mapped directory.
4. The subdomain directory should contain these files:

   ```text
   index.html
   app.js
   core.js
   questions.js
   styles.css
   favicon.svg
   READ-ME.txt
   ```

5. Search for **SSL** in the website dashboard. Ensure the subdomain has an active certificate and HTTPS is enabled. Use `https://quiz.yourdomain.com` to open the app.
6. Enter a username, start a short quiz, check an answer, and finish the session to verify scoring. Share the subdomain URL after testing it on a phone.

If the subdomain was added as its own **Custom PHP/HTML** website, open that website's own Dashboard and upload into its `public_html` directory instead. Hostinger Website Builder sites use a different workflow; a Custom PHP/HTML website provides the File Manager needed for this app.

### If your DNS is managed elsewhere

At the provider managing your DNS, point the subdomain to the hosting plan's IP address with an **A record**. For `quiz.yourdomain.com`, use host/name `quiz` and the hosting IP displayed in hPanel as the value. Allow time for the DNS change to propagate before checking SSL and opening the site.

### Update the Hostinger upload package

The hosted website uses the files in `quiz-reviewer/dist/` directly. After changing them, run `npm test`, then recreate the ZIP from PowerShell in the repository root:

```powershell
Compress-Archive -Path '.\quiz-reviewer\dist\*' -DestinationPath '.\quiz-reviewer\it401-hostinger.zip' -Force
```

Upload and extract the updated files into the same subdomain directory, replacing the previous app files. Reload the site with **Ctrl+F5**. Versioned asset URLs help load the revised questionnaire after an update. Completed scores in the same browser remain saved; attempts started with an earlier questionnaire must be restarted.

References: [Hostinger subdomains](https://www.hostinger.com/support/1583405-how-to-create-and-delete-subdomains-in-hostinger/), [File Manager uploads and extraction](https://www.hostinger.com/support/1869114-how-to-upload-backups-with-file-manager-in-hostinger/), and [HTTPS settings](https://support.hostinger.com/en/articles/1583201-how-to-enable-or-disable-https-for-your-website-at-hostinger).

## Publish with Netlify Drop

1. Sign in to your Netlify account at https://app.netlify.com/login.
2. Open https://app.netlify.com/drop.
3. In Windows File Explorer, open:

   ```text
   C:\Users\loren\PhpstormProjects\untitled\quiz-reviewer
   ```

4. Drag the `dist` folder onto the Netlify Drop area. The uploaded folder must have `index.html` at its top level, alongside `app.js`, `core.js`, `questions.js`, `styles.css`, and `favicon.svg`.
5. Wait for deployment, then open the generated HTTPS address ending in `.netlify.app`.
6. Check the project's visibility settings. Make it public if you want people outside your Netlify team to play, then test the link in a private/incognito browser window.
7. Share the working URL with your players.

## Check the published quiz

Enter a username, start a short session, check an answer, finish, and inspect Session history. Try the link on a phone. Each visitor's scores stay in their own browser on their own device. Scores from the offline HTML version do not automatically transfer to the hosted address.

## Build command and publish directory

`npm run build` works from either the repository root or `quiz-reviewer/`. It regenerates the cybercrime question bank and coverage report from `quiz-reviewer/src/`, then rebuilds the portable `quiz-reviewer/IT401-Reviewer.html` file. The website's deployable HTML, JavaScript, CSS, and SVG files are in `quiz-reviewer/dist/`.

For a host connected to Git, use these settings relative to the selected project directory:

| Project directory | Build command | Publish directory |
| --- | --- | --- |
| `untitled` repository root | `npm run build` | `quiz-reviewer/dist` |
| `quiz-reviewer` | `npm run build` | `dist` |

For Netlify Drop, upload the `dist` folder directly; it does not require running the build command.

## Publish updates

Edit content in `quiz-reviewer/src/offences-content.js` and UI files in `quiz-reviewer/dist/`, then run `npm run build` and `npm test` from the repository root. Open the existing Netlify project dashboard and drop the updated `dist` folder into the upload area under **Production deploys**. Keep using that project's URL for future updates.

Source: [Netlify Drop Quickstart](https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/).
