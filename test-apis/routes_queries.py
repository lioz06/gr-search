from urllib import response

import requests
import json

BASE_URL = "http://localhost:8081/api/routes"


def route_to_str(route):
    return " -> ".join([node_to_str(n) for n in route])

def node_to_str(node):
    vulnerabilities_info = f"(vulnerabilities: {len(node.get('vulnerabilities', []))})" if "vulnerabilities" in node else ""
    public_exposed_info = "[Public]" if node.get("publicExposed", False) else ""
    return f"{public_exposed_info} {node['name']} {vulnerabilities_info}"

def test_query(description, filter_query, want_count):
    print(f"--- Testing: {description} ---")
    print(f"Query: {filter_query}")
    
    try:
        response = requests.get(BASE_URL, params={'gql': filter_query})
        response.raise_for_status()
        data = response.json()
        routes = data.get("routes", [])
        count = len(routes) if isinstance(routes, list) else 0

        if count == want_count:
            print(f"✅ Success: Received {count} routes.")
            for i, route in enumerate(routes):
                print(f"Route {i+1}: {route_to_str(route)}")
        else:
            print(f"❌ Error: API did not return the expected count, Want {want_count}, Got {count}.")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to API: {e}\n")

if __name__ == "__main__":
    # 1. Routes starting in a public service
    test_query(
        "Publicly Exposed Services", 
        "start.publicExposed == true",
        6
    )

    # 2. Routes ending in a Sink (RDS/SQL)
    test_query(
        "Database Sinks", 
        "end.kind == rds OR end.kind == sql",
        30
    )

    # 3. Routes with vulnerabilities
    test_query(
        "Vulnerable Services", 
        "vulnerabilities.length > 0",
        60
    )

    # 4. Complex Logical Query (Generic Requirement)
    test_query(
        "Publicly Exposed AND Vulnerable", 
        "start.publicExposed == true AND vulnerabilities.length > 0",
        0
    )