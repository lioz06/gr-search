# Microservice Graph Query Engine

[![TypeScript](https://img.shields.io/badge/TS-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

## 1. Project Overview
This project is a RESTful API designed to analyze and query microservice dependency graphs based on the "Train Ticket" architecture. Built with **TypeScript** and **Express**, it identifies **Complete Routes**—sequences of services representing a full flow from an entry point to a terminal destination.


## 2. System Architecture

The engine processes the microservices graph using a non-linear traversal strategy focused on "Route Completeness."

* **Route Discovery:** Automatically identifies "Root" nodes (entry points) and "Leaf/Sink" nodes (terminal points like RDS/SQL).
* **Traversal Engine:** Implements a Depth-First Search (DFS) with path-memoization to ensure zero-cycle interference and full route reconstruction.
* **GQL Layer:** A custom Lexical Parser that evaluates boolean logic against specific path segments (`start`, `end`, and `any`).

## 3. Generic Query Language (GQL)
The API supports a flexible GQL via the `gql` query parameter. This allows you to scope filters to specific parts of a complete route.

| Scope | Description | Example |
| :--- | :--- | :--- |
| `start.` | Filters based on the first node in the route. | `start.publicExposed == true` |
| `end.` | Filters based on the last node (the sink). | `end.kind == rds` |
| `any.` | Filters if *any* node in the route matches. | `any.vulnerabilities.length > 0` |

if the condition does not have any scope, the scope `any.` is used.

**Logical Operators:**
You can combine filters using `AND` or `OR`:
`?gql=start.publicExposed == true AND any.vulnerabilities.length > 0`

**Example Queries:**
* **Critical Vulnerability Path:** `start.publicExposed == true AND any.vulnerabilities.length > 0`
* **Public-to-Database Flow:** `start.publicExposed == true AND end.kind == rds`
* **Tech Stack Compliance:** `any.language == java`

## 4. Quick Start

### Docker Deployment

The project is containerized to ensure the TypeScript environment and data files are correctly configured.

```Bash
docker build -t gr-search .
docker run -p 8081:8081 gr-search
```

### Running Locally (Development)

```Bash
npm install
npm run build
npm start
```

## 5. Validation Suite

A Python-based validation tool is provided to verify the integrity of the returned routes. It is recommended to execute this within a dedicated virtual environment.

### Set up the environment

```Bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install requirements
pip install requests
```

### Run the Validation Script

```Bash
python test-apis/routes_queries.py
```

## 6. Decisions and Assumptions

**Route Completeness:** To satisfy the requirement for "routes between services," the engine specifically filters for full chains. Partial sub-segments are not returned unless they represent a complete execution flow.

**Genericism:** By implementing the start/end/any GQL, the system can handle future JSON schema changes without code modifications.

**Performance:** Graph traversal is performed in-memory, which is optimal for the provided dataset size.