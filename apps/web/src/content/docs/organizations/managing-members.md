# Managing members

The team list is the single place to see who is in the organization, what role they hold, and when they last showed up.

## Reading the list

**Settings → Team members** shows one row per member: name, email, role, and join date. Pending invitations appear at the top with their own state, so you can tell an invited person from an active one at a glance.

## Changing a role

Only the **owner** can change roles. Select a member and pick the new role from the dropdown.

Two things to keep in mind:

- You cannot promote anyone above your own role.
- There is exactly one owner. Promoting someone to owner is how [ownership transfer](/docs/organizations/leaving-an-organization) happens — do it deliberately, because the previous owner loses billing control immediately.

## Removing a member

Admins and owners can remove anyone except the owner. Removing someone revokes their access immediately: their sessions stop working and every org-scoped API call they make starts returning 403.

What they built stays. Agents, knowledge bases, and widgets they created remain in the organization and keep working — removal is an access decision, not a content decision.

If you want their work gone rather than just hidden, delete it explicitly afterwards.

## Sessions after removal

Removal does not sign the person out of Convio itself. They stay logged into their own account and can still reach organizations they belong to elsewhere. What ends is their access to this one.
