# killportall

A powerful cross-platform Node.js CLI tool for efficiently killing processes on specified ports with detailed logging and interactive mode.

[![npm version](https://badge.fury.io/js/killportall.svg)](https://badge.fury.io/js/killportall)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/killportall.svg)](https://nodejs.org)
[![Downloads](https://img.shields.io/npm/dm/killportall.svg)](https://www.npmjs.com/package/killportall)

## Features

- 🎯 Kill processes on single or multiple ports
- 📊 Interactive mode to select ports from a list
- 🔄 Configurable retry mechanism
- 📝 Detailed process information display
- ⚙️ Configuration file support
- 🖥️ Cross-platform support (Windows, macOS, Linux)
- 🎨 JSON output format for scripting
- 🚀 Fast and efficient port killing
- 🔍 Debug mode for troubleshooting
- 🛡️ Robust error handling

## Quick Start

```bash
# Install globally
npm install -g killportall

# Kill a single port
killportall 3000

# Kill multiple ports
killportall 3000 8080 5000

# Interactive mode
killportall -i
```

## Installation

### Global Installation (Recommended)
```bash
npm install -g killportall
```

### Local Installation
```bash
npm install killportall
```

### Development Setup
```bash
# Clone the repository
git clone https://github.com/siri1410/killportall.git

# Install dependencies
cd killportall
npm install

# Link for development
npm link
```

## Usage

### Basic Commands

```bash
# Kill a single port
killportall 3000

# Kill multiple ports
killportall 3000 8080 5000

# Kill a range of ports
killportall 3000-3005

# Interactive mode
killportall -i

# JSON output
killportall 3000 --json

# With retries
killportall 3000 --retries 5

# With custom timeout
killportall 3000 --timeout 2000
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `-r, --retries <number>` | Number of retry attempts | 3 |
| `-t, --timeout <ms>` | Timeout between retries | 1000 |
| `-i, --interactive` | Run in interactive mode | false |
| `-j, --json` | Output results in JSON format | false |
| `--config <key=value>` | Set configuration value | - |
| `-v, --version` | Display version number | - |
| `-h, --help` | Display help information | - |

### Configuration

Create a `.killportallrc.json` file in your home or project directory:

```json
{
  "retries": 3,
  "timeout": 1000,
  "interactive": false,
  "outputFormat": "text"
}
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=killportall:* killportall 3000

# Enable specific debug categories
DEBUG=killportall:cli,killportall:config killportall 3000
```

## API Usage

```javascript
import { killPorts } from 'killportall';

async function cleanupPorts() {
    try {
        const results = await killPorts([3000, 3001], {
            retries: 3,
            timeout: 1000
        });
        console.log('Results:', results);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## Error Handling

The tool handles various error scenarios:
- Invalid port numbers (outside 1-65535 range)
- Permission issues (requires elevated privileges)
- Process not found on port
- Failed kill attempts
- Configuration errors
- Network interface issues

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESM module syntax
- Maintain cross-platform compatibility
- Add tests for new features
- Update documentation
- Follow semantic versioning

## Publication Steps

### For Maintainers

1. Prepare for publication:
```bash
npm version patch  # or minor/major
npm test
npm login
```

2. Test locally:
```bash
npm link
killportall --version
```

3. Publish:
```bash
npm run clean
npm run link

npm run reset
npm run setup

npm publish
# or for beta
npm publish --tag beta
```

4. Create release:
```bash
git tag v1.0.3
git push origin v1.0.3
```

## Version Guidelines

- MAJOR (1.x.x): Breaking changes
- MINOR (x.1.x): New features (backward compatible)
- PATCH (x.x.1): Bug fixes (backward compatible)

## License

MIT © [Sireesh Yarlagadda](https://github.com/siri1410)

## Support

- GitHub Issues: [Report Bug](https://github.com/siri1410/killportall/issues)
- Email: contact@yarlis.com

## Acknowledgments

- Cross-platform support inspired by Node.js community
- CLI design influenced by popular tools like npm and yarn
