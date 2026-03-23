# Microservice Graph Query Engine

## 1. Project Overview
This project is a RESTful API designed to analyze and query microservice dependency graphs based on the "Train Ticket" architecture. Built with **TypeScript** and **Express**, it identifies **Complete Routes**—sequences of services representing a full flow from an entry point to a terminal destination.

### Key Logic: Complete Route Discovery
The engine distinguishes between a simple "path" and a "complete route":
* **Root Nodes:** Nodes with no incoming dependencies (e.g., `frontend`).
* **Terminal Nodes:** Nodes with no outgoing dependencies (e.g., `rds`, `sql`, or leaf services).
* **Cycle Detection:** The traversal algorithm prevents infinite loops by tracking visited nodes within each unique path.

---

## 2. Generic Query Language (GQL)
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

---

## 3. Setup and Execution

### Docker Deployment
The project is containerized to ensure the TypeScript environment and data files are correctly configured.

**1. Build and Run:**

```Bash
docker build -t gr-search .
docker run -p 8081:8081 gr-search
```

**2. Validation & Testing**

Use a virtual environment to run the validation script against the running container.

1. Set up the environment:

```Bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install requirements
pip install requests
```

2. Run the Validation Script:

```Bash
python test-apis/routes_queries.py
```

## 5. Decisions and Assumptions

    Route Completeness: To satisfy the requirement for "routes between services," the engine specifically filters for full chains. Partial sub-segments are not returned unless they represent a complete execution flow.

    Genericism: By implementing the start/end/any GQL, the system can handle future JSON schema changes without code modifications.

    Performance: Graph traversal is performed in-memory, which is optimal for the provided dataset size.