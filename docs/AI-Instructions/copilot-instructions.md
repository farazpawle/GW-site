# GitHub Copilot Instructions

## ⚠️ CRITICAL: Database Schema Changes

**NEVER use commands that destroy database data!**

### **FORBIDDEN Commands (Will Delete All Data):**
- ❌ `prisma migrate reset` - Drops entire database
- ❌ `prisma migrate dev --force` - Can wipe data
- ❌ `prisma db push --force-reset` - Destroys all tables
- ❌ Deleting migration files manually
- ❌ Editing old migration files

### **SAFE Schema Modification Workflow:**
1. **Always backup first**: `npm run db:backup` (if available)
2. **Only modify `schema.prisma`**: Make targeted changes to specific models/fields
3. **Create additive migrations**: Use `prisma migrate dev --name descriptive_name`
4. **Test in development**: Never run migrations directly on production
5. **Review generated SQL**: Check `.sql` files in `prisma/migrations/` before applying
6. **Use safe alterations**:
   - ✅ Add new columns with defaults or as optional
   - ✅ Add new models/tables
   - ✅ Add indexes
   - ✅ Rename with `@map()` attribute (preserves data)
   - ⚠️ Avoid: Dropping columns, changing types, removing required fields

### **When Editing Schema:**
- Work on **specific parts only** (single model, single field)
- Always add new fields as optional first: `field String?`
- Use data migration scripts for complex changes
- Never drop and recreate tables - migrate them instead

### **If You Must Reset (Development Only):**
1. Export data: `pg_dump` or custom export script
2. Run reset command
3. Re-import data
4. Document what was lost in git commit message

## Documentation Management

11. **Documentation**: Always use `docs/` folder for project documentation with proper folder structure:
   - **Structure**:
     ```
     docs/
       ├── 01-Getting-Started/    # Setup, quickstart, overview
       ├── 02-Learning/           # Tutorials, guides
       ├── 03-Technical-Specs/    # Technical plans, architecture
       ├── 04-Implementation/     # Planning docs for NEW features ONLY
       ├── 05-Features/           # Completed features documentation ONLY
       ├── 06-Deployment/         # Deployment guides
       └── 07-Troubleshooting/    # Common issues, fixes
     ```
   - **04-Implementation/** - Use ONLY for:
     - New feature specifications
     - Phase planning documents (ideas, proposals)
     - Technical requirements documents
     - Architecture proposals
     - Files should be named: `Phase-X-[Feature-Name].md`
   - **05-Features/** - Use ONLY for:
     - Completed feature documentation
     - Create subfolder per feature: `[feature-name]/`
     - Must contain:
       - `README.md` - Feature overview with status
       - `Phase-X-Phase-Y-COMPLETE.md` - Completion reports
       - `[Feature-Name]-Guide.md` - Usage guides (optional)
   - **Rule**: NEVER put completion reports in Implementation folder. Always move them to Features folder when phase completes.

### Rules for AI

**When creating new documentation:**
1. **Always** place files in the correct folder (see structure above)
2. **Always** update `docs/README.md` if adding new categories
3. Use clear naming: `kebab-case-descriptive-name.md`
4. Add file reference to appropriate section in `docs/README.md`

**When implementing new features:**
1. Create tracking doc in `04-Implementation/Phase-X-FeatureName.md`
2. Include: Goal, Tasks checklist, Progress tracking, Time estimates
3. Create feature docs in `05-Features/feature-name/`
4. Update implementation doc as you complete tasks

**What goes where:**
- **Onboarding?** → `01-Getting-Started/`
- **Learning Prisma/Next.js?** → `02-Learning/`
- **Database schema?** → `03-Technical-Specs/`
- **Task tracking?** → `04-Implementation/`
- **How feature works?** → `05-Features/[feature-name]/`
- **Deploy steps?** → `06-Deployment/`
- **Error fixes?** → `07-Troubleshooting/`

**Never:**
- ❌ Put files in root `docs/` folder
- ❌ Create random subfolders outside this structure
- ❌ Mix project docs with learning materials
- ❌ Leave files scattered

### Quick Reference

**Starting new phase?**
```bash
# Create: docs/04-Implementation/Phase-X-FeatureName.md
# Template: Goal, Tasks, Files to Create, Completion Criteria, Progress Log
```

**Adding new feature?**
```bash
# Create: docs/05-Features/feature-name/feature-name.md
# Include: What it does, How it works, API docs, Examples
```

**Troubleshooting issue?**
```bash
# Create: docs/07-Troubleshooting/issue-description.md
# Include: Problem, Cause, Solution, Prevention
```

---

**Remember:** Documentation organization = Project clarity. Keep it clean! 🎯
