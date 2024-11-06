# killportall

A powerful cross-platform Node.js CLI tool for efficiently killing processes on specified ports with detailed logging and interactive mode.

## Features

- 🎯 Kill processes on single or multiple ports
- 📊 Interactive mode to select ports from a list
- 🔄 Configurable retry mechanism
- 📝 Detailed process information display
- ⚙️ Configuration file support
- 🖥️ Cross-platform support (Windows, macOS, Linux)
- 🎨 JSON output format for scripting
- 🚀 Fast and efficient port killing

## Installation

```bash
npm install -g killportall
```

## Usage

### Basic Usage

Kill a single port:
```bash
killportall 3000
```

Kill multiple ports:
```bash
killportall 3000 8080 5000
```

Kill a range of ports:
```bash
killportall 3000-3005
```

### Interactive Mode

Run in interactive mode to select ports from a list:
```bash
killportall -i
# or
killportall --interactive
```

### Options

- `-r, --retries <number>`: Number of retry attempts (default: 3)
- `-t, --timeout <ms>`: Timeout between retries in milliseconds (default: 1000)
- `-i, --interactive`: Run in interactive mode
- `-j, --json`: Output results in JSON format
- `--config <key=value>`: Set a configuration value
- `-v, --version`: Display version number
- `-h, --help`: Display help information

### Configuration

The tool supports configuration through a `.killportallrc.json` file in either the current directory or your home directory. Available configuration options:

```json
{
  "retries": 3,
  "timeout": 1000,
  "interactive": false,
  "outputFormat": "text"
}
```

Set configuration values using the CLI:
```bash
killportall --config retries=5
killportall --config timeout=2000
killportall --config interactive=true
killportall --config outputFormat=json
```

## Process Information

Before killing a process, the tool displays detailed information:
- Process ID (PID)
- Process name/command
- User (on Unix-like systems)
- CPU usage
- Memory usage

## Output Formats

### Text Output (Default)
```
✓ Port 3000: Process killed successfully
✗ Port 8080: No process found
```

### JSON Output
```json
[
  {
    "port": 3000,
    "success": true
  },
  {
    "port": 8080,
    "success": false,
    "error": "No process found"
  }
]
```

## Error Handling

The tool includes robust error handling:
- Invalid port numbers
- Permission issues
- Process not found
- Failed kill attempts

## Debug Mode

Enable debug logging:
```bash
DEBUG=killportall:* killportall 3000
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the SDODS License - see the [LICENSE](LICENSE) file for details.
