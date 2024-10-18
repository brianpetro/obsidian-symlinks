# 🔗 Symlink Manager Plugin for Obsidian `v1.0`

**Effortlessly manage platform-specific symlinks in your Obsidian vault, ensuring seamless synchronization across macOS, Windows, and Linux.**

- **Create and manage symlinks within your vault or to external locations.**
- **Automatically recreate symlinks when switching between platforms.**
- **User-friendly interface for adding and removing symlinks.**

> [!TIP]
> Join our community discussions on [GitHub](https://github.com/yourusername/symlink-manager-plugin/discussions) to share your experiences and suggest new features!

Hey there! I'm [Your Name], the developer behind the Symlink Manager Plugin. I believe in creating tools that simplify workflows and enhance productivity. Follow me on [Twitter](https://x.com/wfhbrian) for updates and sneak peeks!

## A Brief Introduction

Managing symlinks across different operating systems can be a challenge, especially when syncing your Obsidian vault between devices. The Symlink Manager Plugin is designed to simplify this process, ensuring your symlinks are always up-to-date and functional, no matter which platform you're on.

## Mission

Our mission is to provide a seamless experience for Obsidian users who need to manage symlinks across multiple platforms. By automating the recreation of symlinks and providing an intuitive interface, we aim to enhance your productivity and reduce the technical hassle.

## Discover the Symlink Manager Plugin

The Symlink Manager Plugin automates the process of creating and managing symlinks within your Obsidian vault, as well as linking to external files and directories. Here's what makes it stand out:

### Key Features

- **Platform-Specific Symlink Recreation**: Automatically detects your operating system and recreates symlinks accordingly.
- **External Symlink Support**: Create symlinks to files and folders outside your vault.
- **User-Friendly Interface**: Easily add or remove symlinks with intuitive modals.
- **Persistent Configurations**: Stores platform-specific target paths and prompts for updates when needed.

## How It Works

### Managing Symlinks

- **Creating Symlinks**: Use the command palette to add a new symlink. Select the destination folder within your vault, specify the symlink name, and enter the target path.
- **Platform Detection**: The plugin automatically detects your operating system and manages symlinks accordingly.
- **Recreation on Startup**: Symlinks are recreated each time you start Obsidian on a different platform.
- **Handling Missing Targets**: If a target path isn't available on the current platform, you'll be prompted to provide a new one.

### Technical Details

- **Symlink Configurations**: Stored in a persistent data file within the plugin's directory, maintaining platform-specific paths.
- **Error Handling**: Provides clear notifications if symlink creation fails due to permission issues or invalid paths.
- **Compatibility**: Works with Windows (`win32`), macOS (`darwin`), and Linux platforms.

## Easy Installation

### Installing from Obsidian Community Plugins

1. Open Obsidian and navigate to `Settings` > `Community plugins`.
2. Disable `Safe mode` to allow third-party plugins.
3. Click on `Browse` and search for `Symlink Manager Plugin`.
4. Click `Install` and then `Enable`.

Alternatively, you can manually install the plugin:

- Download the latest release from [GitHub](https://github.com/brianpetro/obsidian-symlinks).
- Extract the files into your vault's `.obsidian/plugins/obsidian-symlinks` directory.
- Enable the plugin from the `Community plugins` settings.

## Settings

### Default Settings

- **Symlink Storage**: Configurations are saved within the plugin, ensuring your symlinks are managed consistently.
- **Automatic Recreation**: Enabled by default to recreate symlinks upon starting Obsidian.

### Additional Setup

#### File/Folder Exclusions

- Exclude specific files or folders from symlink management if needed.

#### Changing Symlink Paths

- Easily update symlink paths via the provided interface, accommodating changes in your file system.

## Features

### Adding a Symlink

1. **Open Command Palette**: Press `Ctrl+P` or `Cmd+P`.
2. **Select Command**: Choose `Add Symlink`.
3. **Choose Destination Folder**: Select the folder within your vault.
4. **Enter Symlink Name**: Specify the name for your symlink.
5. **Enter Target Path**: Provide the absolute path to the target file or directory.
6. **Confirm**: Click `Add` to create the symlink.

### Removing a Symlink

- Use the `Remove Symlink` command from the command palette.
- Select the symlink you wish to remove from the list.

### Handling Missing Target Paths

- If a symlink's target path isn't available on the current platform, a prompt will appear to update the path.

## Join Our Community

Your feedback and contributions are invaluable. Join our community to share your experiences, report issues, or suggest new features.

- **GitHub Issues**: Report bugs or request features at [GitHub Issues](https://github.com/brianpetro/obsidian-symlinks/issues).
- **Discussions**: Participate in discussions at [GitHub Discussions](https://github.com/brianpetro/obsidian-symlinks/discussions).

## Contribute

### Non-Technical Contributions

- **Share Your Experience**: Let others know how the plugin has helped you.
- **Suggest Features**: We're always looking for ideas to improve.

### Technical Contributions

- **Code Enhancements**: Submit pull requests with improvements or bug fixes.
- **Documentation**: Help us improve the documentation by contributing to the README or docs site.

## Troubleshooting Common Issues

### Permission Errors on Windows

- **Enable Developer Mode**: Allows creating symlinks without administrative privileges.
  - Go to **Settings** > **Update & Security** > **For Developers** and enable **Developer Mode**.
- **Run as Administrator**: Start Obsidian with administrative privileges.

### Symlink Creation Fails

- **Invalid Paths**: Ensure that the target path exists and is correctly typed.
- **File System Permissions**: Verify that you have write permissions for the destination directory.

### Missing Target Path Prompt Doesn't Appear

- **Restart Obsidian**: Sometimes, restarting can resolve temporary issues.
- **Check Console for Errors**: Open the developer console (`Ctrl+Shift+I` or `Cmd+Option+I`) and look for error messages.

## Developers

### Integrate with Other Plugins

- **Access Symlink Configurations**: Utilize the stored symlink data for enhanced interoperability.
- **Contribute**: Feel free to improve the plugin or adapt it for specialized use cases.

## Support

If you find this plugin helpful, please consider supporting its development:

- **Star the Repository**: Show your appreciation by starring the [GitHub repo](https://github.com/brianpetro/obsidian-symlinks).
- **Spread the Word**: Share the plugin with others who might find it useful.

## Meet the Creator

I'm [Your Name], passionate about creating tools that make life easier. When I'm not coding, I enjoy hiking and exploring new technologies.

- **Website**: [smartconnections.app](https://smartconnections.app)
- **Twitter**: [@wfhbrian](https://x.com/wfhbrian)
- **GitHub**: [brianpetro](https://github.com/brianpetro)

---

*Empower your Obsidian experience with seamless symlink management. Download the Symlink Manager Plugin today!*