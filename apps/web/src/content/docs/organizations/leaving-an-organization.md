# Leaving an organization

Members can remove themselves. Owners cannot — they have to hand the role over first.

## Leaving as a member or admin

**Settings → Team members**, find your own row, and use the leave action. Confirm, and your membership is deleted immediately.

Your access ends at once: org-scoped API calls return 403, and the organization disappears from your org switcher.

## Leaving as the owner

The leave control is not available to owners, by design. An organization cannot end up with nobody able to delete it or wipe its data.

To leave, do this in order:

1. Promote someone else to owner — see [Transferring ownership](/docs/organizations/transferring-ownership)
2. Wait until their role shows as owner
3. Then leave as normal

The transfer requires your session, so it cannot be done after you are gone.

## What happens to your work

Nothing. Everything you built stays in the organization and keeps running. Leaving removes your access, not your contributions.

The one exception is personal data you brought with you — your own avatar and profile live on your account, not the organization, and are unaffected either way.
