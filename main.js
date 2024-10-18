const { Plugin, Notice, SuggestModal, Modal, Setting, TFolder } = require('obsidian');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = class SymlinkManagerPlugin extends Plugin {
  async onload() {
    console.log('Symlink Manager Plugin loaded');

    // Load existing symlink configurations or initialize an empty array
    this.symlinks = (await this.loadData()) || [];

    // Recreate symlinks for the current platform
    await this.recreateSymlinks();

    // Add command to add a new symlink
    this.addCommand({
      id: 'add-symlink',
      name: 'Add Symlink',
      callback: () => this.promptAddSymlink(),
    });

    // Add command to remove a symlink
    this.addCommand({
      id: 'remove-symlink',
      name: 'Remove Symlink',
      callback: () => this.promptRemoveSymlink(),
    });
  }

  async onunload() {
    console.log('Symlink Manager Plugin unloaded');
  }

  // Recreate symlinks based on the stored configurations
  async recreateSymlinks() {
    const platform = os.platform(); // 'win32', 'darwin', 'linux'
    const vaultPath = this.app.vault.adapter.basePath;

    for (const link of this.symlinks) {
      const linkPath = path.isAbsolute(link.linkPath)
        ? link.linkPath
        : path.join(vaultPath, link.linkPath);

      let targetPath = link.targets[platform];

      if (!targetPath) {
        // Prompt the user to select a new target path for the current platform
        new ReSelectTargetModal(this.app, link.linkPath, async (newTargetPath) => {
          link.targets[platform] = newTargetPath;
          await this.saveData(this.symlinks);
          this.createSymlink(linkPath, newTargetPath, link.linkPath);
        }).open();
        continue;
      }

      // Ensure the target path is absolute
      if (!path.isAbsolute(targetPath)) {
        targetPath = path.join(vaultPath, targetPath);
      }

      this.createSymlink(linkPath, targetPath, link.linkPath);
    }
  }

  // Create a symlink and handle exceptions
  createSymlink(linkPath, targetPath, displayLinkPath) {
    try {
      // Remove existing link if it exists
      if (fs.existsSync(linkPath)) {
        fs.unlinkSync(linkPath);
      }

      // Determine symlink type ('file', 'dir', or 'junction')
      let symlinkType;
      const platform = os.platform();
      let targetStats;

      try {
        targetStats = fs.lstatSync(targetPath);
      } catch (err) {
        new Notice(`Target path does not exist: ${targetPath}`);
        console.error(`Target path does not exist: ${targetPath}`, err);
        return;
      }

      if (targetStats.isFile()) {
        symlinkType = platform === 'win32' ? 'file' : undefined;
      } else if (targetStats.isDirectory()) {
        symlinkType = platform === 'win32' ? 'junction' : undefined;
      } else {
        symlinkType = platform === 'win32' ? 'file' : undefined;
      }

      // Create symlink
      fs.symlinkSync(targetPath, linkPath, symlinkType);
      console.log(`Created symlink: ${linkPath} -> ${targetPath}`);
    } catch (err) {
      console.error(`Failed to create symlink: ${linkPath} -> ${targetPath}`, err);
      new Notice(`Failed to create symlink: ${displayLinkPath}`);
    }
  }

  // Prompt user to add a new symlink
  async promptAddSymlink() {
    new SymlinkModal(this.app, async (linkPath, targetPath) => {
      await this.addSymlink(linkPath, targetPath);
    }).open();
  }

  // Prompt user to remove an existing symlink
  async promptRemoveSymlink() {
    const symlinkPaths = this.symlinks.map((link) => link.linkPath);

    new RemoveSymlinkModal(this.app, symlinkPaths, async (linkPath) => {
      await this.removeSymlink(linkPath);
    }).open();
  }

  // Add a new symlink configuration and recreate symlinks
  async addSymlink(linkPath, targetPath) {
    const platform = os.platform();
    const existingLink = this.symlinks.find((link) => link.linkPath === linkPath);

    if (existingLink) {
      existingLink.targets[platform] = targetPath;
    } else {
      const newLink = {
        linkPath,
        targets: {
          [platform]: targetPath,
        },
      };
      this.symlinks.push(newLink);
    }

    await this.saveData(this.symlinks);
    await this.recreateSymlinks();
    new Notice(`Symlink added: ${linkPath}`);
  }

  // Remove a symlink configuration and update symlinks
  async removeSymlink(linkPath) {
    this.symlinks = this.symlinks.filter((link) => link.linkPath !== linkPath);
    await this.saveData(this.symlinks);
    await this.recreateSymlinks();
    new Notice(`Symlink removed: ${linkPath}`);
  }
};


class RemoveSymlinkModal extends SuggestModal {
  constructor(app, suggestions, onSubmit) {
    super(app);
    this.suggestions = suggestions;
    this.onSubmit = onSubmit;
    this.setPlaceholder('Select a symlink to remove');
  }

  getSuggestions(query) {
    return this.suggestions.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  }

  renderSuggestion(item, el) {
    el.createEl('div', { text: item });
  }

  onChooseSuggestion(item) {
    this.close();
    this.onSubmit(item);
  }
}


class SymlinkModal extends Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Add Symlink' });

    let folderPath = '';
    let fileName = '';
    let targetPath = '';
    let previewEl;

    // Get list of folders in the vault
    const folders = [];
    const addFolder = (folder) => {
      folders.push(folder.path);
      for (const child of folder.children) {
        if (child instanceof TFolder) {
          addFolder(child);
        }
      }
    };
    addFolder(this.app.vault.getRoot());

    // Symlink Folder Selection
    new Setting(contentEl)
      .setName('Symlink Folder')
      .setDesc('Select the folder where the symlink will be created.')
      .addDropdown((dropdown) => {
        folders.forEach((folder) => {
          dropdown.addOption(folder, folder);
        });
        dropdown.onChange((value) => {
          folderPath = value;
          this.updatePreview(folderPath, fileName);
        });
        dropdown.setValue(folders[0]); // Default to root
        folderPath = folders[0];
      });

    // Symlink File Name Input
    new Setting(contentEl)
      .setName('Symlink File Name')
      .setDesc('Enter the name of the symlink file. If no extension is provided, .md will be added automatically.')
      .addText((text) =>
        text.onChange((value) => {
          fileName = value.trim();
          // Add .md extension if not provided
          if (!path.extname(fileName)) {
            fileName += '.md';
          }
          this.updatePreview(folderPath, fileName);
        })
      );

    // Target Path Input
    new Setting(contentEl)
      .setName('Target Path')
      .setDesc('Enter the absolute path of the target file or directory.')
      .addText((text) =>
        text.onChange((value) => {
          targetPath = value.trim();
        })
      );

    // Preview
    previewEl = contentEl.createEl('div', { text: 'Preview: ' });

    // Submit Button
    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('Add')
        .setCta()
        .onClick(() => {
          if (!folderPath || !fileName || !targetPath) {
            new Notice('Please complete all fields.');
            return;
          }

          if (!this.is_valid_file_name(fileName)) {
            new Notice('Invalid file name. Please use only letters, numbers, underscores, hyphens, and periods.');
            return;
          }

          const link_path = this.get_platform_specific_path(path.join(folderPath, fileName));
          const target_path = this.get_platform_specific_path(targetPath);
          this.close();
          this.onSubmit(link_path, target_path);
        })
    );

    this.updatePreview(folderPath, fileName);
  }

  updatePreview(folderPath, fileName) {
    const previewEl = this.contentEl.querySelector('div:last-child');
    const previewPath = this.get_platform_specific_path(path.join(folderPath, fileName));
    previewEl.setText(`Preview: ${previewPath}`);
  }

  is_valid_file_name(fileName) {
    const validFileNameRegex = /^[a-zA-Z0-9_\-\.]+$/;
    return validFileNameRegex.test(fileName);
  }

  get_platform_specific_path(filePath) {
    return filePath.split(path.sep).join(path.posix.sep);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}


class ReSelectTargetModal extends Modal {
  constructor(app, linkPath, onSubmit) {
    super(app);
    this.linkPath = linkPath;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Target Path Missing' });
    contentEl.createEl('p', {
      text: `The target path for symlink "${this.linkPath}" is missing on this platform. Please select a new target path.`,
    });

    let targetPath = '';

    new Setting(contentEl)
      .setName('New Target Path')
      .setDesc('Enter the new target path the symlink points to (absolute path).')
      .addText((text) =>
        text.onChange((value) => {
          targetPath = value.trim();
        })
      );

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('Update')
        .setCta()
        .onClick(() => {
          if (!targetPath) {
            new Notice('Please enter a target path.');
            return;
          }
          this.close();
          this.onSubmit(targetPath);
        })
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
