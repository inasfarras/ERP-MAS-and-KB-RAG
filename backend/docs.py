from typing import Dict, Any
from fastapi.openapi.utils import get_openapi

# API Documentation Metadata
API_TITLE = "Modular ERP System API"
API_DESCRIPTION = """
# Modular ERP System API Documentation

This API provides endpoints for a comprehensive Enterprise Resource Planning (ERP) system with future integration capabilities for Multi-Agent Systems (MAS) and Knowledge Graph-enhanced Retrieval-Augmented Generation (KG-RAG).

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Core ERP Modules**: Finance, Sales, Inventory, Projects, and more
- **Business Intelligence**: Analytics and reporting capabilities
- **Integration Layer**: Extensible architecture for third-party integrations
- **Future AI Integration**: Prepared for MAS and KG-RAG integration

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Obtain a token using the `/token` endpoint
2. Include the token in the Authorization header: `Authorization: Bearer <token>`

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages in the following format:

```json
{
    "detail": "Error message description"
}
```

## Versioning

The API is versioned through the URL path. The current version is v1.0.0.
"""

API_VERSION = "1.0.0"
API_TERMS_OF_SERVICE = "https://example.com/terms/"
API_CONTACT = {
    "name": "API Support",
    "url": "https://example.com/contact",
    "email": "support@example.com"
}
API_LICENSE_INFO = {
    "name": "MIT",
    "url": "https://opensource.org/licenses/MIT"
}

# API Tags Metadata
API_TAGS_METADATA = [
    {
        "name": "Authentication",
        "description": "Authentication and authorization endpoints",
    },
    {
        "name": "Finance & Accounting",
        "description": "Financial management, accounting, and reporting endpoints",
    },
    {
        "name": "Sales & Order Management",
        "description": "Sales, orders, and customer management endpoints",
    },
    {
        "name": "Inventory & Supply Chain",
        "description": "Inventory management and supply chain operations endpoints",
    },
    {
        "name": "Business Process Controls",
        "description": "Business process management and workflow endpoints",
    },
    {
        "name": "Project & Job Management",
        "description": "Project tracking and resource management endpoints",
    },
    {
        "name": "Material Requirements Planning",
        "description": "MRP and production planning endpoints",
    },
    {
        "name": "Business Intelligence",
        "description": "Analytics, reporting, and dashboard endpoints",
    },
    {
        "name": "Integration Layer",
        "description": "Third-party integration and extension endpoints",
    },
    {
        "name": "AI Integration",
        "description": "Multi-Agent System and Knowledge Graph RAG integration endpoints",
    }
]

def custom_openapi() -> Dict[str, Any]:
    """
    Custom OpenAPI schema generator with additional metadata and security schemes
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=API_TITLE,
        version=API_VERSION,
        description=API_DESCRIPTION,
        routes=app.routes,
        tags=API_TAGS_METADATA,
        terms_of_service=API_TERMS_OF_SERVICE,
        contact=API_CONTACT,
        license_info=API_LICENSE_INFO,
    )

    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token in the format: Bearer <token>"
        }
    }

    # Add global security requirement
    openapi_schema["security"] = [{"bearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema 