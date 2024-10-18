import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';
import archiver from 'archiver';
import axios from 'axios';
import { exec } from 'child_process';

dotenv.config();

// Read manifest.json
const manifest_json = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
const version = manifest_json.version;
const manifest_id = manifest_json.id;

// Create readline interface
const rl_interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl_interface.question(`Confirm release version (${version}): `, (confirmed_version) => {
  if (!confirmed_version) confirmed_version = version;
  const release_name = confirmed_version;
  console.log(`Creating release for version ${confirmed_version}`);
  rl_interface.question('Enter release description: ', async (release_description) => {
    rl_interface.close();

    // Prepare release data
    const release_data = {
      tag_name: `${confirmed_version}`,
      name: release_name,
      body: release_description,
      draft: false,
      prerelease: false
    };

    // Environment variables
    const github_token = process.env.GH_TOKEN;
    const github_repo = process.env.GH_REPO;

    if (!github_token || !github_repo) {
      console.error('Error: GitHub token or repository not set in .env file.');
      return;
    }

    try {
      // Create GitHub release
      const release_response = await axios.post(`https://api.github.com/repos/${github_repo}/releases`, release_data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${github_token}`
        }
      });

      const release_info = release_response.data;
      console.log('Release created:', release_info);

      const uploadAssetCurl = (assetPath, assetName) => {
        const uploadUrl = `${release_info.upload_url.split('{')[0]}?name=${encodeURIComponent(assetName)}`;
        const mimeType = 'application/octet-stream';

        const command = `curl -X POST -H "Authorization: Bearer ${github_token}" -H "Content-Type: ${mimeType}" --data-binary @${assetPath} "${uploadUrl}"`;

        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error uploading file ${assetName}:`, error);
            return;
          }
          console.log(`Uploaded file: ${assetName}`);
          console.log(stdout);
        });
      };
      
      // Create a zip file of main.js and manifest.json
      const zip_name = `${manifest_id}-${confirmed_version}.zip`;
      const output = fs.createWriteStream(`./${zip_name}`);
      const archive = archiver('zip', { zlib: { level: 0 } });

      archive.on('error', function(err) {
        throw err;
      });

      archive.on('end', async function() {
        console.log('Archive wrote %d bytes', archive.pointer());

        // Upload zip file after archive has been finalized
        uploadAssetCurl(`./${zip_name}`, zip_name);
        console.log('Zip file uploaded.');

        // Upload main.js and manifest.json
        uploadAssetCurl('./main.js', 'main.js');
        uploadAssetCurl('./manifest.json', 'manifest.json');

        // Remove zip file
        fs.unlinkSync(`./${zip_name}`);

        console.log('All files uploaded.');
      });

      archive.pipe(output);
      archive.file('main.js', { name: 'main.js' });
      archive.file('manifest.json', { name: 'manifest.json' });
      await archive.finalize();

    } catch (error) {
      console.error('Error in release process:', error);
    }
  });
});

