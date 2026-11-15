import os

dirs = [
    "backend/app/core",
    "backend/app/api",
    "backend/app/models",
    "backend/app/schemas",
    "backend/app/database",
    "backend/app/services",
    "backend/app/nasa",
    "backend/app/geospatial",
    "backend/app/recommendations",
    "backend/app/analytics",
    "backend/app/authentication",
    "backend/app/background",
    "backend/app/utils",
    "backend/tests",
    "frontend/src/components/ui",
    "frontend/src/components/layout",
    "frontend/src/components/maps",
    "frontend/src/components/charts",
    "frontend/src/components/voice",
    "frontend/src/pages/public",
    "frontend/src/pages/farmer",
    "frontend/src/pages/officer",
    "frontend/src/pages/admin",
    "frontend/src/layouts",
    "frontend/src/hooks",
    "frontend/src/services",
    "frontend/src/contexts",
    "frontend/src/i18n/locales/en",
    "frontend/src/i18n/locales/ta",
    "frontend/src/types",
    "frontend/src/utils",
    "frontend/src/assets",
    "frontend/src/styles",
    "frontend/public",
    "database/migrations",
    "docs",
    "scripts"
]

for d in dirs:
    os.makedirs(os.path.join(r"C:\NASA", d), exist_ok=True)

print("Created all directories successfully.")

