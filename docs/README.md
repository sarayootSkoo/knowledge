# Knowledge Docs

Symlinked documentation from project repositories into a unified graph data source.

## Current Links

| Link Name | Target |
|-----------|--------|
| `oms-order-docs` | `../../oms-order/docs` |
| `oms-order-discuss` | `../../oms-order/discussion` |
| `oms-order-specs` | `../../oms-order/specs` |
| `oms-order-tasks` | `../../oms-order/tasks` |
| `oms-webapp-docs` | `../../oms-webapp/docs` |
| `oms-webapp-discuss` | `../../oms-webapp/discussion` |
| `oms-webapp-help-docs` | `../../oms-webapp/help-docs` |
| `oms-webapp-specs` | `../../oms-webapp/specs` |
| `oms-webapp-tasks` | `../../oms-webapp/tasks` |

## Commands

```bash
cd /Users/grammer/Documents/git-central/knowledge/docs

# oms-order
ln -s ../../oms-order/docs oms-order-docs
ln -s ../../oms-order/discussion oms-order-discuss
ln -s ../../oms-order/specs oms-order-specs
ln -s ../../oms-order/tasks oms-order-tasks

# oms-webapp
ln -s ../../oms-webapp/docs oms-webapp-docs
ln -s ../../oms-webapp/discussion oms-webapp-discuss
ln -s ../../oms-webapp/help-docs oms-webapp-help-docs
ln -s ../../oms-webapp/specs oms-webapp-specs
ln -s ../../oms-webapp/tasks oms-webapp-tasks
```

## Rebuild Graph Data

```bash
cd /Users/grammer/Documents/git-central/knowledge/project/knowledge-graph
node scripts/build-graph-data.mjs /Users/grammer/Documents/git-central/knowledge/docs --out dist/graph-data.json
```
