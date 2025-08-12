Language/Style:
- JavaScript ES2020+ with ESM modules (type: module) and JSX.
- React function components with hooks.
- Tailwind CSS for styling; PostCSS pipeline.
- ESLint flat config used; key rules: recommended + react-hooks, no-unused-vars (ignores ALL_CAPS), react-refresh only-export-components warn.
- Formatting: Prettier not explicitly configured; follow ESLint and typical Prettier defaults.
Naming/Structure:
- Components under src/components/* and pages under src/pages/*.
- Back-end routes under server/routes/*, models under server/models/*, DB under server/database/*.
- Use descriptive names; avoid abbreviations.
Docs/Commits:
- README documents workflows and standards; commit messages in French with conventional style: type(scope): description (feat, fix, docs, style, refactor, etc.).
Security/Secrets:
- .env.example and .env.production exist; use environment variables for secrets.
Edge Cases:
- Production detection also true when PORT is set; may cause production behavior on platforms setting PORT implicitly.