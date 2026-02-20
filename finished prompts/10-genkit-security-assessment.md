# Prompt: Genkit Security Assessment

## Objective
Assess the security of the Genkit AI framework configuration in SANKALP. Verify that the Genkit developer UI is not exposed in production and that production code does not import development-only modules.

## Actions to Execute

1. **Run** `scripts/audit-genkit-security.ts`
2. **Check** `src/ai/dev.ts` for environment guards preventing production exposure
3. **Verify** no production source files import `src/ai/dev.ts`
4. **Review** `src/ai/genkit.ts` for the chaos proxy wrapper — assess security implications
5. **Check** the `ADVERSARIAL_TEST` environment variable handler for security risks
6. **Assess** whether the `__ADVERSARIAL_MOCK_RESOLVER__` global can be abused

## Expected Output
A Genkit security assessment report with all findings and hardening recommendations.
