
# DNS Inspector

A command-line DNS inspection tool built using Node.js
and its built-in DNS module.

## Features

- IPv4 (A) record lookup
- IPv6 (AAAA) record lookup
- MX record lookup
- NS record lookup
- CNAME lookup
- Reverse DNS (PTR) lookup
- System hostname lookup
- Asynchronous DNS queries
- Individual DNS error handling

## Technologies

- Node.js
- JavaScript
- DNS module
- Readline module

## Installation

Clone the repository:

    git clone YOUR_REPOSITORY_URL

Navigate into the project:

    cd dns-inspector

Run the application:

    npm start

## Usage

Enter a domain or website URL when prompted.

The application retrieves available DNS records and
displays the results in the terminal.

You can optionally enter an IP address to perform
reverse DNS lookup.

## Note

This tool uses the DNS resolver configured on the
operating system. It does not implement a recursive
DNS resolver from scratch.
