# Login activity and sessions

Your account's security surface, on one screen: where you have signed in from, and how to cut access off.

## Login activity

**Settings → Profile** shows a table of your recent sign-in sessions. Each row records the device, the approximate location, the IP address, the time, and the current status.

Use it when something looks wrong. An unfamiliar location or a device you do not recognise is the first thing to check after a suspected compromise.

Location is derived from the IP address, so treat it as a hint rather than a fact — VPNs, corporate proxies, and mobile carriers all make it imprecise. The IP address and device are the reliable fields.

## Ending sessions

Two options, both on the profile page:

- **Sign out of this device** — ends only the session you are currently using. Other devices stay signed in.
- **Sign out everywhere** — ends every active session across all devices, including this one, and revokes all refresh tokens.

Signing out everywhere is the response to a lost device or a suspected compromise. It does not change your password, so change that too if you suspect the password itself leaked.

## Sessions and organizations

Signing out is an account-level action. It ends your Convio session entirely — you lose access to every organization you belong to, not just one.

Removing yourself from a single organization is a different thing entirely, and it leaves your session intact. See [Leaving an organization](/docs/organizations/leaving-an-organization).

## Organization audit log

Sign-in activity is about your account. The **Settings → Audit log** page is about the organization: who created, updated, deleted, invited, removed, changed roles on, configured, or disabled things, and when.

Recorded actions include `created`, `updated`, `deleted`, `invited`, `removed`, `role_changed`, `configured`, `disabled`, and `violation`. Audit logs are readable by admins and owners only.
