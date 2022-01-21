!!! danger "WIP"
    This application was developed for private use in a trusted environment.
    Due to popular demand a basic permission system has been added. 
    It does its job protecting the most critical parts of the application, but it is **not yet recommended** to 
    give accounts to completely untrusted users.
    Work is done to improve the permission system, but it's not yet fully done and tested.

## Permission levels
The following table roughly defines the capabilities of each role

| Group            | Capabilities                                                 |
| ---------------- | ------------------------------------------------------------ |
| logged in user   | Can do almost nothing without a group.                        |
| guest            | - Search and view recipes<br />- write comments <br />- change user settings (e.g. language, theme, password) |
| user             | Can do basically everything except for what admins can do    |
| admin            | - Create, edit and delete external storage<br />- Create, edit and delete synced paths |
| django superuser | Ignores all permission checks and can access admin interface |

## Creating User accounts

!!! warning
    Users without groups cannot do anything. Make sure to assign them a group!

You can either create new users through the admin interface or by sending them invite links.

Invite links can be generated on the System page. If you specify a username during the creation of the link 
the person using it won't be able to change that name.

## Managing Permissions
Management of permissions can currently only be achieved through the django admin interface.

!!! warning
    Please do not rename the groups as this breaks the permission system.

