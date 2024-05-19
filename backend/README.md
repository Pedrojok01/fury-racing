# Name

<p align="center">
<img src="./images/logo.png" width="200" alt="Name">
<br/>

- [Name](#name)
- [About](#about)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Quickstart](#quickstart)
- [Usage](#usage)

# About

<!-- Include a blurb about your project, including a link to docs if applicable -->

# Getting Started

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [foundry](https://getfoundry.sh/)
  - You'll know you did it right if you can run `forge --version` and you see a response like `forge 0.2.0 (816e00b 2023-03-16T00:05:26.396218Z)`
  <!-- Additional requirements here -->

## Installation

```bash
git clone <MY_REPO>
cd <MY_REPO>
npm install
```

## Quickstart

```bash
npm start
```

# Usage

```bash
  curl --location 'http://localhost:3000/api/races/data' \
  --header 'Content-Type: application/json' \
  --data '{
      "attributes": "<inputs_of_xx>"
  }'
```

xx is sequence of integers from 00 to 99.
